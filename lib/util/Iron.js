// Load modules

const Config = require('config');
const Iron = require('iron');

// Internal logic

const stamp = '<__APR_01__>';

function wrap(value) {
  if (typeof value === 'string') {
    const wrapped = {
      value,
      stamp,
      moment: Date.now(),
      claim: true
    };

    return wrapped;
  }

  return value;
}

function unwrap(wrapped) {
  if (typeof wrapped.value === 'string' &&
    wrapped.stamp === stamp &&
    typeof wrapped.moment === 'number' &&
    wrapped.moment < Date.now() &&
    wrapped.claim === true) {
    return wrapped.value;
  }

  return wrapped;
}

class Instance {

  constructor(settings) {
    this.password = settings.password;
    this.options = Object.assign({}, Iron.defaults, settings.options);
  }

  seal(plain) {
    return new Promise((resolve, reject) => {
      Iron.seal(wrap(plain), this.password, this.options, (err, sealed) => {
        if (err) {
          return reject(err);
        }

        return resolve(sealed);
      });
    });
  }

  unseal(sealed) {
    return new Promise((resolve, reject) => {
      Iron.unseal(sealed, this.password, this.options, (err, plain) => {
        if (err) {
          return reject(err);
        }

        return resolve(unwrap(plain));
      });
    });
  }
}

// Define exports

module.exports = new Instance(Config.get('iron'));
