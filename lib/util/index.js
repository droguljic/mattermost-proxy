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

exports.parse = function(urlString, method) {
  const url = URL.parse(urlString, true);
  url.matches = function(patterns, path = false) {
    return exports.toArray(patterns).some((pattern) => {
      if (typeof pattern === 'string') {
        return exports.match(path ? url.path : url.pathname, pattern);
      } else if (typeof pattern === 'object') {
        const target = pattern.path ? url.path : url.pathname;
        if (!pattern.method) {
          return exports.match(target, pattern.url);
        }

        return pattern.method === method && exports.match(target, pattern.url);
      }

      return false;
    });
  };

  return url;
};

exports.match = function(path, patterns) {
  if (Array.isArray(patterns)) {
    return patterns.some((pattern) => minimatch(path, pattern));
  }

  console.log(path, patterns);

  return minimatch(path, patterns);
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
