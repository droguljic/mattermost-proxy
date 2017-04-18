// Load modules

const Co = require('co');

const API = require('./API');
const Session = require('./Session');
const User = require('./User');
const Util = require('../util');

// Internal logic

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
  return Session.exists(req);
};

exports.consume = Co.wrap(function* (res, userInfo) {
  let user = yield User.find({ email: userInfo.email });
  if (!user) {
    const password = User.password();
    const auth = yield Session.getRoot().getAuth();
    const userObj = yield API.user.create({ data: marshal(userInfo, password) }, { auth });
    user = yield new User(unmarshal(userObj, password)).insert();
  }

  const session = yield Session.create(user);

  session.state(res);
});
