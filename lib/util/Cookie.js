// Load modules

const Assert = require('assert');
const HTTP = require('http');

const Cookie = require('cookie');

// Internal logic

const SET_COOKIE_HEADER = 'set-cookie';
const defaultOptions = {
  path: '/',
  httpOnly: true,
  sameSite: 'Lax'
};

function apply(options) {
  return Object.assign({}, defaultOptions, options);
}

class Wrapper {

  constructor(req, res) {
    this.req = req;
    this.res = res;
    this.options = defaultOptions;
  }

  use(options) {
    this.options = apply(options);
    return this;
  }

  get(name) {
    Assert.ok(this.req, 'Request must be defined');
    return Cookie.parse(this.req.headers.cookie || '')[name];
  }

  has(name) {
    return Boolean(this.get(name));
  }

  set(name, value, options) {
    Assert.ok(this.res, 'Response must be defined');
    const settings = options ? apply(options) : this.options;
    if (settings.maxAge != null) {
      const maxAge = settings.maxAge * 1000; // Convert to milliseconds
      settings.expires = maxAge === 0 ? new Date(0) : new Date(Date.now() + maxAge);
    }

    const cookie = [Cookie.serialize(name, value, settings)];
    const header = this.res.getHeader(SET_COOKIE_HEADER);
    if (header) {
      if (Array.isArray(header)) {
        header.push(...cookie);
        return this;
      }

      cookie.push(header);
      cookie.reverse();
    }

    this.res.setHeader(SET_COOKIE_HEADER, [cookie]);

    return this;
  }

  remove(name, options) {
    const settings = Object.assign({}, options, { maxAge: 0 });
    return this.set(name, '', settings);
  }
}

// Define exports

exports.for = function(req, res) {
  if (arguments.length === 1) {
    const source = req;
    if (source instanceof HTTP.IncomingMessage) {
      return new Wrapper(source, undefined);
    } else if (source instanceof HTTP.ServerResponse) {
      return new Wrapper(undefined, source);
    }
  } else if (arguments.length === 2) {
    return new Wrapper(req, res);
  }

  throw new TypeError('Cannot create cookie, unsupported argument combination');
};
