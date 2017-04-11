// Load modules

const Config = require('config');

const Cookie = require('../util').Cookie;

// Internal logic

class Service {
  constructor(settings) {
    this.settings = settings;
  }

  valid(req) {
    return Cookie.for(req).has(this.settings.session.cookie.name);
  }

  consume(res, userInfo) {
    const token = userInfo.email;
    const cookie = this.settings.session.cookie;
    Cookie.for(res).set(cookie.name, token, cookie.options);

    return Promise.resolve();
  }
}

// Define exports

module.exports = new Service(Config.get('mattermost'));
