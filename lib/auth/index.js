// Load modules

const Config = require('config');

const OIDC = require('./OIDC');
const Util = require('../util');

// Internal logic

const CHECK_PATHNAME = Config.get('auth.check.pathname');
const DESTINATION_COOKIE = Config.get('auth.destination.cookie');

// Define exports

exports.OIDC = OIDC;

exports.writeStatus = function(url, req, res, evaluate) {
  const allow = req.method === 'GET' && url.pathname === CHECK_PATHNAME;
  const exists = allow && evaluate(req);
  const strict = url.query.strict;
  if (!exists && strict !== '1' && strict !== 'true') {
    return false;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: `${exists ? '' : 'UN'}AUTHENTICATED` }));

  return true;
};

exports.finalize = function(req, res) {
  Util.HTTP.redirect(res, Util.Cookie.for(req).get(DESTINATION_COOKIE.name));
};
