// Load modules

const Crypto = require('crypto');

const Co = require('co');

const Api = require('./Api');
const Session = require('./Session');
const User = require('./User');
const Util = require('../util');

// Internal logic

const PASSWORD_LENGTH = 32;
const PASSWORD_ENCODING = 'base64';

function generatePassword() {
  return Crypto.randomBytes(PASSWORD_LENGTH).toString(PASSWORD_ENCODING);
}

function marshal(userInfo, password) {
  const output = Util.toSnakeCase(userInfo);
  return Object.assign(output, { password });
}

function unmarshal(userObj, password) {
  const output = Util.toCamelCase(userObj);
  return Object.assign(output, { password });
}

// Define exports

exports.valid = function(req) {
  return !Session.expired(req);
};

exports.consume = Co.wrap(function* (res, userInfo) {
  let user = yield User.find({ email: userInfo.email });
  if (!user) {
    const password = generatePassword();
    const userObj = yield Api.user.create(marshal(userInfo, password));
    user = yield new User(unmarshal(userObj, password)).insert();
  }

  const outcome = yield Api.user.login({ login_id: user.email, password: user.password });
  Session.create(res, outcome.token, outcome.duration);
});
