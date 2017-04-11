// Load modules

const URL = require('url');

const Boom = require('boom');

const Cookie = require('./Cookie');
const Iron = require('./Iron');
const Log = require('../../config/logging').get('UTIL');

// Define exports

exports.Cookie = Cookie;

exports.Iron = Iron;

exports.redirect = function(res, url) {
  res.writeHead(302, {
    Location: url
  });
  res.end();
};

exports.sendServerError = function(err, req, res) {
  if (res.finished) {
    Log.error('Cannot send server error because response is already closed');
    return;
  }

  const output = (err.isBoom ? err : Boom.badImplementation('', err)).output;
  const accept = req.headers.accept;
  if (accept && accept.toLowerCase().includes('application/json')) {
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(output.payload));
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.write(`${output.payload.statusCode} ${output.payload.message}`);
  }

  res.statusCode = output.statusCode;
  res.end();
};

exports.parse = function(url) {
  return URL.parse(url, true);
};
