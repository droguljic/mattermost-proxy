// Load modules

const Crypto = require('crypto');

const Co = require('co');
const Config = require('config');
const Issuer = require('openid-client').Issuer;

const Util = require('../util');

// Internal logic

const STATE_LENGTH = 20;
const STATE_ENCODING = 'hex';

function format(userInfo) {
  return {
    oid: userInfo.sub,
    email: userInfo.email,
    username: userInfo.preferred_username,
    firstName: userInfo.given_name,
    lastName: userInfo.family_name,
    locale: userInfo.locale || 'en'
  };
}

class OIDC {

  constructor(settings, destination) {
    this.settings = settings;
    this.destination = destination;
    this.issuer = new Issuer(settings.provider);
    this.client = new this.issuer.Client(settings.client);
  }

  handle(req, res) {
    const self = this;
    return Co(function* () {
      const url = Util.parse(req.url);
      if (!url.query.code) {
        const authorizationURL = self.getAuthorizationURL(req, res);
        return Util.HTTP.redirect(res, authorizationURL);
      }

      const token = yield self.getToken(req, res);
      const userInfo = yield self.client.userinfo(token);

      return format(userInfo);
    });
  }

  getAuthorizationURL(req, res) {
    const settings = this.settings;
    const state = Crypto.randomBytes(STATE_LENGTH).toString(STATE_ENCODING);
    const params = Object.assign({}, settings.authParams, { state });
    const url = Util.parse(req.url);

    Util.Cookie.for(res)
      .set(settings.cookie.name, state, settings.cookie.options)
      .set(this.destination.cookie.name, url.path, this.destination.cookie.options);

    return this.client.authorizationUrl(params);
  }

  getToken(req, res) {
    const settings = this.settings;
    const cookie = Util.Cookie.for(req, res);
    const state = cookie.get(settings.cookie.name);
    const url = Util.parse(req.url);

    cookie
      .remove(settings.cookie.name, settings.cookie.options)
      .remove(this.destination.cookie.name, this.destination.cookie.options);

    return this.client.authorizationCallback(settings.authParams.redirect_uri, url.query, { state });
  }
}

// Define exports

module.exports = new OIDC(Config.get('auth.oidc'), Config.get('auth.destination'));
