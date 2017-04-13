// Load modules

const Assert = require('assert');

const Co = require('co');
const VError = require('verror');

const Iron = require('../util').Iron;
const MongoConnection = require('../../config/datastore/MongoConnection');

// Internal logic

const name = 'users'; // The name of the collection
let collection; // The collection it self

const init = Co.wrap(function* () {
  const MainDb = MongoConnection.Main;
  try {
    collection = MainDb.collection(name, { strict: true });
  } catch (err) {
    // Collection doesn't exists so create it
    collection = yield MainDb.createCollection(name);
    yield collection.createIndex({ email: 1 }, { unique: true });
    yield collection.createIndex({ username: 1 }, { unique: true });
  }
});

MongoConnection.prependListener('open', init);

function timestamp(user, insert = true) {
  const now = new Date();
  if (insert) {
    user.createdAt = now;
  }

  user.updatedAt = now;

  return user;
}

function wrap(obj) {
  let user;
  if (obj) {
    if (!obj._id && !obj.value) {
      throw new TypeError('Provided object cannot be warped as a \'User\'');
    }

    user = new User(obj._id ? obj : obj.value); // eslint-disable-line no-use-before-define
  }

  return user ? user.unsealPassword() : Promise.resolve(null);
}

class User {

  constructor(props) {
    this.set(props);
  }

  static find(query) {
    return collection.findOne(query)
      .then(wrap)
      .catch((err) => {
        throw new VError(err, `Failed find user by query (${query})`);
      });
  }

  set(props) {
    return Object.assign(this, props);
  }

  sealPassword() {
    return Iron.seal(this.password)
      .then((sealed) => {
        this.password = sealed;
        return this;
      });
  }

  unsealPassword() {
    return Iron.unseal(this.password)
      .then((plain) => {
        this.password = plain;
        return this;
      });
  }


  validate(insert = true) {
    return new Promise((resolve, reject) => {
      try {
        Assert.ok(this.email && typeof this.email === 'string', 'Property email must be provided');
        if (insert) {
          Assert.ok(this.username && typeof this.username === 'string', 'Property username must be provided');
          Assert.ok(this.password && typeof this.password === 'string', 'Property password must be provided');
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  insert() {
    return this.validate()
      .then(() => this.sealPassword())
      .then((user) => collection.insertOne(timestamp(user)))
      .then((result) => collection.findOne({ _id: result.insertedId }))
      .then(wrap)
      .catch((err) => {
        throw new VError(err, `Failed to insert the user [${this.email}]`);
      });
  }

  update() {
    return this.validate(false)
      .then(() => (this.password ? this.sealPassword() : this))
      .then((user) => collection.findOneAndUpdate({
        email: user.email
      }, {
        $set: timestamp(user, false)
      }, {
        upsert: false,
        returnOriginal: false
      }))
      .then(wrap)
      .catch((err) => {
        throw new VError(err, `Failed to update the user [${this.email}]`);
      });
  }
}


// Define exports

module.exports = User;
