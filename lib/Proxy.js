// Load modules

const Http = require('http');

const Config = require('config');
const HttpProxy = require('http-proxy');

const Log = require('../config/logging').get('PROXY');

// Internal logic

class Proxy {

  constructor(port, options) {
    this.port = port;
    this.forward = HttpProxy.createProxy(options);
    this.server = Http.createServer((req, res) => {
      this.handle(req, res)
        .then(() => {
          Log.debug(`Proxing HTTP request ${req.method} ${req.url}`);
          this.forward.web(req, res);
        });
    });
    this.addListeners();
  }

  addListeners() {
    this.server.on('upgrade', (req, socket, head) => {
      Log.debug(`Proxing WS request ${req.url}`);
      this.forward.ws(req, socket, head);
    });
    this.forward.on('error', (err) => Log.error(err, 'Error occurred while proxying request'));
  }

  handle(req, res) { // eslint-disable-line no-unused-vars, class-methods-use-this
    return Promise.resolve(null);
  }

  start() {
    this.server.listen(this.port, () => {
      Log.info(`Mattermost proxy is running on port ${this.port}`);
    });
  }
}

// Define exports

module.exports = new Proxy(Config.get('port'), Config.get('proxy'));
