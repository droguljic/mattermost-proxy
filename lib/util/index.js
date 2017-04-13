// Load modules

const URL = require('url');

const Boom = require('boom');
const camelCase = require('lodash.camelcase');
const mapObj = require('map-obj');
const minimatch = require('minimatch');
const snakeCase = require('lodash.snakecase');

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
  const headers = {};
  let data;
  if (accept && accept.toLowerCase().includes('application/json')) {
    headers['Content-Type'] = 'application/json';
    data = JSON.stringify(output.payload);
  } else {
    headers['Content-Type'] = 'text/plain';
    data = `${output.payload.statusCode} ${output.payload.message}`;
  }

  res.writeHead(output.statusCode, output.payload.error, headers);
  res.end(data);
};

exports.parse = function(url) {
  return URL.parse(url, true);
};

exports.toArray = function(value) {
  if (value || value === false || value === 0 || value === '') {
    return Array.isArray(value) ? value : Array.of(value);
  }

  return [];
};

exports.match = function(path, patterns) {
  return Boolean(exports.toArray(patterns).find((pattern) => minimatch(path, pattern)));
};

exports.toSnakeCase = function(obj) {
  return mapObj(obj, (key, val) => [snakeCase(key), val], { deep: true });
};

exports.toCamelCase = function(obj) {
  return mapObj(obj, (key, val) => [camelCase(key), val], { deep: true });
};
