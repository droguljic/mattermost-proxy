// Load modules

const Config = require('config');

const OIDC = require('./OIDC');
const Util = require('../util');

// Internal logic

const DESTINATION_COOKIE = Config.get('auth.destination.cookie');

// Define exports

exports.OIDC = OIDC;

exports.finalize = function(req, res) {
  Util.HTTP.redirect(res, Util.Cookie.for(req).get(DESTINATION_COOKIE.name));
};
