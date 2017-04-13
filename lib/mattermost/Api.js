// Load modules

const Axios = require('axios');
const Co = require('co');
const Cookie = require('cookie');
const Config = require('config');
const VError = require('verror');

const Log = require('../../config/logging').get('MATTERMOST_API');
const Session = require('./Session');
const Util = require('../util');

// Internal logic

let axios;
let endpoint;

function init(options) {
  axios = Axios.create({
    baseURL: options.base
  });
  endpoint = options.endpoint;
}

init(Config.get('mattermost.api'));

function extractToken(response) {
  const token = response.headers.token;
  let duration;
  if (Object.prototype.hasOwnProperty.call(response.headers, 'set-cookie')) {
    const cookie = Util.toArray(response.headers['set-cookie'])
      .map((entry) => Cookie.parse(entry))
      .find((entry) => entry[Session.cookie.name]);

    duration = Number((cookie || {})['max-age']);
  }

  return { token, duration };
}

const getAuthorization = Co.wrap(function* () {
  if (Session.system.expired()) {
    try {
      const response = yield axios.request({
        method: endpoint.user.login.method,
        url: endpoint.user.login.url,
        data: Session.system.credentials
      });
      const output = extractToken(response);
      Session.system.create(output.token, output.duration);
    } catch (err) {
      if (err.response) {
        Log.error({ response: err.response }, 'Error response from Mattermost API during system session refresh');
      }
      throw new VError(err, 'Failed to refresh Mattermost system session');
    }
  }

  return Session.system.token;
});

const request = Co.wrap(function* (message, options) {
  const settings = Object.assign({ authorize: true }, options);
  const headers = {};
  if (settings.authorize) {
    const token = yield getAuthorization();
    headers.authorization = `Bearer ${token}`;
  }

  try {
    const response = yield axios.request(Object.assign(message, { headers }));
    if (typeof settings.transform === 'function') {
      return settings.transform(response);
    } else if (settings.transform === false) {
      return response;
    }

    return response.data;
  } catch (err) {
    Log.error({
      response: err.response
    }, `Error response from Mattermost API resource ${message.method} ${message.url}`);
    throw new VError(err, `Request to Mattermost API failed, ${message.method} ${message.url}`);
  }
});


// Define exports

module.exports = {
  user: {
    create(userInfo) {
      return request({
        method: endpoint.user.create.method,
        url: endpoint.user.create.url,
        data: userInfo
      });
    },
    login(credentials) {
      return request({
        method: endpoint.user.login.method,
        url: endpoint.user.login.url,
        data: credentials
      }, {
        authorize: false,
        transform: extractToken
      });
    }
  }
};
