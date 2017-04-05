// Load modules

const Http = require('http');

const Config = require('config');
const HttpProxy = require('http-proxy');

const Log = require('../config/logging').get();

// Internal logic

const proxy = HttpProxy.createServer(Config.get('proxy'));
const server = Http.createServer((req, res) => {
  Log.debug(`Proxing request ${req.method} ${req.url}`);
  proxy.web(req, res);
});

function init(port) {
  server.listen(port, () => {
    Log.info(`Mattermost proxy is running on port ${port}`);
  });
}

init(Config.get('port'));

// Define exports

module.exports = proxy;
