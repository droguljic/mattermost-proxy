// Load modules

const Assert = require('assert');

const Co = require('co');
const Config = require('config');
const Cookie = require('cookie');

const API = require('./API');
const Util = require('../util');

// Internal logic

const SESSION_COOKIE = Config.get('mattermost.session.cookie');
const OFFSET = 300; // 5 minutes, in seconds

let defaultDuration; // Default session duration, set during app initialization
let root; // The root session instance

function maxAge(duration) {
  const span = duration || defaultDuration;
  Assert.ok(typeof span === 'number', 'Cannot calculate max age without valid duration');

  return span - OFFSET;
}

maxAge.from = function(expiresAt) {
  return (expiresAt - Date.now()) / 1000;
};

function extractAuth(data, response) {
  const token = response.headers.token;
  let duration;
  if (Object.prototype.hasOwnProperty.call(response.headers, 'set-cookie')) {
    const cookie = Util.toArray(response.headers['set-cookie'])
      .map((entry) => Cookie.parse(entry))
      .find((entry) => entry[SESSION_COOKIE.name]);

    if (cookie) {
      duration = Number(cookie['max-age'] || cookie['Max-Age']);
    }
  }

  return { token, duration };
}

function getHeaders(req) {
  return req ? req.headers : undefined;
}

class Session {

  constructor(credentials, auth) {
    this.credentials = credentials;
    this.update(auth);
  }

  static exists(req) {
    return req.headers.authorization || Util.Cookie.for(req).has(SESSION_COOKIE.name);
  }

  static create(req, credentials) {
    const headers = getHeaders(req);
    let data = credentials;
    if (!credentials.loginId) {
      data = { loginId: credentials.username || credentials.email, password: credentials.password };
    }

    return API.user.login({ headers, data }, { digest: extractAuth })
      .then((auth) => new Session(credentials, auth));
  }

  static createRoot(credentials) {
    return Session.create(null, credentials)
      .then((session) => {
        root = session;
        return root;
      });
  }

  static getRoot() {
    return root;
  }

  static setDuration(duration) {
    Assert.ok(typeof duration === 'number', 'Default duration must be a number');
    defaultDuration = duration;
  }

  expired() {
    return !this.expiresAt || Date.now() >= this.expiresAt;
  }

  update(auth) {
    Assert.ok(auth.token, 'Cannot update session without provided token');
    this.token = auth.token;
    this.expiresAt = Date.now() + (maxAge(auth.duration) * 1000);
  }

  state(res) {
    Assert.ok(!this.expired(), 'Cannot set session cookie because session has expired');
    const options = Object.assign({}, SESSION_COOKIE.options, { maxAge: maxAge.from(this.expiresAt) });
    Util.Cookie.for(res).set(SESSION_COOKIE.name, this.token, options);
  }

  refresh(req) {
    const headers = getHeaders(req);
    return API.user.login({ headers, data: this.credentials }, { digest: extractAuth })
      .then((auth) => {
        this.update(auth);
        return this;
      });
  }

  getAuth(req) {
    return Co.call(this, function* () {
      if (this.expired()) {
        yield this.refresh(req);
      }

      return { token: this.token, expiresAt: this.expiresAt };
    });
  }
}

// Define exports

module.exports = Session;
