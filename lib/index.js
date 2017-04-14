// Load modules

const Os = require('os');

const Log = require('../config/logging').get();
const Mattermost = require('./mattermost');
const MongoConnection = require('../config/datastore/MongoConnection');
const Proxy = require('./Proxy');

// Internal logic

function initErrorHandler(err) {
  Log.error(err, 'Error occurred during proxy startup, exiting process');
  process.exit(1);
}

function init() {
  MongoConnection
    .on('open', () => Mattermost.System.start())
    .on('error', initErrorHandler);

  Mattermost.System
    .on('ready', () => Proxy.start())
    .on('error', initErrorHandler);
}

init();

process.on('uncaughtException', (err) => {
  Log.error(err, `Encountered uncaught exception, terminating process [${process.pid}] on host [${Os.hostname()}]`);
  MongoConnection.close();
  process.exit(1);
});
