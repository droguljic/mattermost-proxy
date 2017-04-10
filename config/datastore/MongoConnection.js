// Load modules

const EventEmitter = require('events');

const Config = require('config');
const Db = require('mongodb').Db;
const MongoClient = require('mongodb').MongoClient;
const VError = require('verror');

const Log = require('../logging').get('MONGO_CONNECTION');

// Internal logic

class MongoConnection extends EventEmitter {

  constructor(options) {
    super();
    this.init(options)
      .then(() => this.emit('open'))
      .catch((err) => this.emit('error', err));
  }

  init(options) {
    const connections = [];
    Object.keys(options).forEach((key) => {
      const name = key.replace(/\b\w/g, (l) => l.toUpperCase());
      this[name] = null;
      connections.push(this.create(name, options[key]));
    });

    return Promise.all(connections);
  }

  create(name, settings) {
    return MongoClient.connect(settings.uri)
      .then((db) => {
        this[name] = db;
        this.addListeners(name);
      })
      .catch((err) => {
        throw new VError(err, `Failed to connect to the [${name}] database`);
      });
  }

  addListeners(name) {
    Log.info(`Successfully connected to the [${name}] database`);
    this[name].on('error', (err) => Log.error(err, `Error occurred against the [${name}] database`));
  }

  close() {
    Object.keys(this).forEach((key) => {
      if (this[key] instanceof Db) {
        this[key].close();
      }
    });
  }
}

// Define exports

module.exports = new MongoConnection(Config.get('datastore.mongo'));
