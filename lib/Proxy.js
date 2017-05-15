// Load modules

const Http = require('http');

const Boom = require('boom');
const Co = require('co');
const Config = require('config');
const HttpProxy = require('http-proxy');

const Auth = require('./auth');
const Log = require('../config/logging').get('PROXY');
const Mattermost = require('./mattermost');
const Util = require('./util');

// Internal logic

const ONE_DAY_IN_SECONDS = 86400;

function handleError(err, req, res, msg) {
  Log.error(err, msg || 'Error occurred while proxying request');
  Util.HTTP.sendError(err, req, res);
}

function handleForbidden(path, req, res) {
  Log.error(`Tried to access forbidden path ${path}`);
  Util.HTTP.sendError(Boom.notFound('Unreachable'), req, res);
}

const handleAuth = Co.wrap(function* (url, req, res) {
  if (Auth.writeStatus(url, req, res, Mattermost.Session.exists)) {
    return;
  }

  if (!Mattermost.Service.valid(req)) {
    const userInfo = yield Auth.OIDC.handle(req, res);
    if (url.pathname === Auth.OIDC.settings.callback.pathname) {
      yield Mattermost.Service.consume(req, res, userInfo);
      Auth.finalize(req, res);
    }
  }
});

function handleCORS(proxyRes, req) {
  // Allow not preflighted request with credentials
  if ((req.headers.cookie || req.headers.authorization)
      && proxyRes.headers['access-control-allow-origin']) {
    proxyRes.headers['access-control-allow-credentials'] = 'true';
  }

  // Approve for request to be made using credentials and enable caching
  if (req.method === 'OPTIONS' && proxyRes.headers['access-control-allow-origin']) {
    proxyRes.headers['access-control-allow-credentials'] = 'true';
    proxyRes.headers['access-control-max-age'] = ONE_DAY_IN_SECONDS;
  }
}

class Proxy {

  constructor(host, port, rules, options) {
    this.host = host;
    this.port = port;
    this.rules = rules;
    this.forward = HttpProxy.createProxy(options);
    this.server = Http.createServer();
    this.addListeners();
  }

  addListeners() {
    this.server.on('request', (req, res) => {
      this.inspectWeb(req, res)
        .then(() => this.deliverWeb(req, res))
        .catch((err) => handleError(err, req, res, `Error occurred during HTTP request ${req.method} ${req.url}`));
    });
    this.server.on('upgrade', (req, socket, head) => {
      Log.debug(`Proxing WS request ${req.method} ${req.url}`);
      this.forward.ws(req, socket, head);
    });
    this.forward.on('error', (err, req, res) => {
      Log.error(err, 'Error occurred while proxying request');
      Util.HTTP.sendError(err, req, res);
    });
    this.forward.on('proxyRes', handleCORS);
  }

  inspectWeb(req, res) {
    const url = Util.parse(req.url);
    if (url.matches(this.rules.forbid)) {
      handleForbidden(url.path, req, res);
      return Promise.resolve();
    }

    if (url.matches(this.rules.ignore)) {
      return Promise.resolve();
    }

    return handleAuth(url, req, res);
  }

  deliverWeb(req, res) {
    if (!res.finished) {
      Log.debug(`Proxing HTTP request ${req.method} ${req.url}`);
      this.forward.web(req, res);
    }
  }

  start() {
    this.server.listen(this.port, this.host, () => {
      Log.info(`Mattermost proxy is running on ${this.host}:${this.port}`);
    });
  }
}

// Define exports

module.exports = new Proxy(
  Config.get('host'),
  Config.get('port'),
  Config.get('url.rules'),
  Config.get('proxy')
);
