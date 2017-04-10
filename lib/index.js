// Load modules

const Os = require('os');

const Log = require('../config/logging').get();
const MongoConnection = require('../config/datastore/MongoConnection');
const Proxy = require('./Proxy');

// Internal logic

function init() {
  MongoConnection
    .on('open', () => {
      Proxy.start();
    })
    .on('error', (err) => {
      Log.error(err, 'Error occurred during proxy startup');
    });
}

init();

process.on('uncaughtException', (err) => {
  Log.error(err, `Encountered uncaught exception, terminating process [${process.pid}] on host [${Os.hostname()}]`);
  MongoConnection.close();
  process.exit(1);
});
