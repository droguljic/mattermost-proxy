// Load modules

const Assert = require('assert');

const Axios = require('axios');
const Co = require('co');
const Config = require('config');
const VError = require('verror');

const Log = require('../../config/logging').get('MATTERMOST_API');

// Internal logic

let axios;
let endpoint;

function init(options) {
  axios = Axios.create({ baseURL: options.base, timeout: 5000 });
  endpoint = options.endpoint;
}

init(Config.get('mattermost.api'));

const request = Co.wrap(function* (message, options) {
  const settings = Object.assign({ authorize: true }, options);
  if (settings.authorize) {
    Assert.ok(settings.auth, 'Cannot authorize request to Mattermost API without provided authentication');
    const token = typeof settings.auth === 'object' ? settings.auth.token : settings.auth;
    const authorization = `Bearer ${token}`;
    message.headers = Object.assign({}, message.headers, { authorization });
  }

  try {
    const response = yield axios.request(message);
    if (typeof settings.digest === 'function') {
      return settings.digest(response);
    } else if (settings.digest === false) {
      return response;
    }

    return response.data;
  } catch (err) {
    if (err.response) {
      Log.error({
        response: Object.assign({}, err.response, { config: undefined, request: undefined })
      }, `Error response from Mattermost API resource ${message.method} ${message.url}`);
    }
    throw new VError(err, `Request to Mattermost API failed, ${message.method} ${message.url}`);
  }
});


// Define exports

module.exports = {
  user: {
    initialLoad(options) {
      return request(endpoint.user.initialLoad, Object.assign({ authorize: false }, options));
    },
    create(message, options) {
      return request(Object.assign({}, endpoint.user.create, message), options);
    },
    login(message, options) {
      return request(Object.assign({}, endpoint.user.login, message), Object.assign({ authorize: false }, options));
    },
    update(message, options) {
      return request(Object.assign({}, endpoint.user.update, message), options);
    }
  },
  system: {
    ping() {
      return request(Object.assign({}, endpoint.system.ping, { timeout: 1000 }), { authorize: false });
    },
    getConfig(options) {
      return request(endpoint.system.getConfig, options);
    },
    updateConfig(message, options) {
      return request(Object.assign({}, endpoint.system.updateConfig, message), options);
    }
  }
};