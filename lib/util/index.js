// Load modules

const URL = require('url');

const camelCase = require('lodash.camelcase');
const mapObj = require('map-obj');
const minimatch = require('minimatch');
const snakeCase = require('lodash.snakecase');

const Cookie = require('./Cookie');
const HTTP = require('./HTTP');
const Iron = require('./Iron');

// Define exports

exports.Cookie = Cookie;

exports.HTTP = HTTP;

exports.Iron = Iron;

exports.parse = function(url) {
  const urlObject = URL.parse(url, true);
  urlObject.matches = function(patterns, path = false) {
    return exports.match(path ? urlObject.path : urlObject.pathname, patterns);
  };

  return urlObject;
};

exports.match = function(path, patterns) {
  return Boolean(exports.toArray(patterns).find((pattern) => minimatch(path, pattern)));
};

exports.toArray = function(value) {
  if (value || value === false || value === 0 || value === '') {
    return Array.isArray(value) ? value : Array.of(value);
  }

  return [];
};

exports.toSnakeCase = function(obj) {
  return mapObj(obj, (key, val) => [snakeCase(key), val], { deep: true });
};

exports.toCamelCase = function(obj) {
  return mapObj(obj, (key, val) => [camelCase(key), val], { deep: true });
};
