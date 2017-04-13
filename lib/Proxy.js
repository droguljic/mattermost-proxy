// Load modules

const Http = require('http');

const Co = require('co');
const Config = require('config');
const HttpProxy = require('http-proxy');

const Log = require('../config/logging').get('PROXY');
const MattermostService = require('./mattermost').Service;
const OIDC = require('./auth').OIDC;
const Util = require('./util');

// Internal logic

class Proxy {

  constructor(port, ignore, snapshot, options) {
    this.port = port;
    this.ignore = ignore;
    this.snapshot = snapshot;
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
    const url = Util.parse(req.url);
    if (Util.match(url.pathname, this.ignore.paths)) {
      return Promise.resolve();
    }

    return Co.call(this, function* () {
      if (!MattermostService.valid(req)) {
        const userInfo = yield OIDC.handle(req, res);
        if (url.pathname === Config.get('auth.oidc.callback.pathname')) {
          yield MattermostService.consume(res, userInfo);
          Util.redirect(res, Util.Cookie.for(req).get(this.snapshot.cookie.name));
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
  Config.get('ignore'),
  Config.get('snapshot'),
  Config.get('proxy')
);
