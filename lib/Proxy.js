// Load modules

const Http = require('http');

const Co = require('co');
const Config = require('config');
const HttpProxy = require('http-proxy');

const Auth = require('./auth');
const Log = require('../config/logging').get('PROXY');
const Mattermost = require('./mattermost');
const Util = require('./util');

// Internal logic

function handleForbidden(pathname, req, res) {
  Log.error(`Tried to access forbidden path ${pathname}`);
  Util.sendServerError(new Error(`Path ${pathname} is forbidden`), req, res);
}

class Proxy {

  constructor(port, rules, options) {
    this.port = port;
    this.rules = rules;
    this.forward = HttpProxy.createProxy(options);
    this.server = Http.createServer();
    this.addListeners();
  }

  addListeners() {
    this.server.on('request', (req, res) => {
      this.handle(req, res)
        .then(() => {
          if (!res.finished) {
            Log.debug(`Proxing HTTP request ${req.method} ${req.url}`);
            this.forward.web(req, res);
          }
        })
        .catch((err) => {
          Log.error(err, 'Error occurred while handling HTTP request');
          Util.sendServerError(err, req, res);
        });
    });
    this.server.on('upgrade', (req, socket, head) => {
      Log.debug(`Proxing WS request ${req.method} ${req.url}`);
      this.forward.ws(req, socket, head);
    });
    this.forward.on('error', (err, req, res) => {
      Log.error(err, 'Error occurred while proxying request');
      Util.sendServerError(err, req, res);
    });
  }

  handle(req, res) {
    return Co.call(this, function* () {
      const url = Util.parse(req.url);
      if (Util.match(url.pathname, this.rules.forbid)) {
        handleForbidden(url.pathname, req, res);
        return;
      }

      if (Util.match(url.pathname, this.rules.ignore)) {
        if (Util.match(url.pathname, '/**/users/create')) {
          // Special handling for this rule because we want to allow first time creation but disable all others
          const load = yield Mattermost.Api.user.initialLoad();
          if (!load.no_accounts) {
            handleForbidden(url.pathname, req, res);
          }
        }
        return;
      }

      if (!Mattermost.Service.valid(req)) {
        const userInfo = yield Auth.OIDC.handle(req, res);
        if (url.pathname === Auth.OIDC.settings.callback.pathname) {
          yield Mattermost.Service.consume(res, userInfo);
          Auth.finalize(req, res);
        }
      }
    });
  }

  start() {
    this.server.listen(this.port, () => {
      Log.info(`Mattermost proxy is running on port ${this.port}`);
    });
  }
}

// Define exports

module.exports = new Proxy(
  Config.get('port'),
  Config.get('url.rules'),
  Config.get('proxy')
);
