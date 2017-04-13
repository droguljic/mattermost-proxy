// Load modules

const Config = require('config');

const Cookie = require('../util').Cookie;

// Internal logic

const DURATION = Config.get('mattermost.session.duration'); // In seconds
const OFFSET = 300; // 5 minutes, in seconds

function maxAge(duration) {
  return (duration || DURATION) - OFFSET;
}

class System {

  constructor(settings) {
    this.credentials = settings.credentials;
    this.token = undefined;
    this.expiresAt = undefined;
  }

  create(token, duration) {
    this.token = token;
    this.expiresAt = Date.now() + (maxAge(duration) * 1000);
  }

  expired() {
    return !this.expiresAt || Date.now() > this.expiresAt;
  }
}

class Session {

  constructor(settings) {
    this.cookie = settings.cookie;
    this.system = new System(settings.system);
  }

  create(res, token, duration) {
    const options = Object.assign({}, this.cookie.options, { maxAge: maxAge(duration) });
    Cookie.for(res).set(this.cookie.name, token, options);
  }

  expired(req) {
    return !Cookie.for(req).has(this.cookie.name);
  }
}

// Define exports

module.exports = new Session(Config.get('mattermost.session'));
