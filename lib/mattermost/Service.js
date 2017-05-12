// Load modules

const Co = require('co');

const API = require('./API');
const Session = require('./Session');
const User = require('./User');
const Util = require('../util');

// Internal logic

function marshal(userData, append) {
  const output = Util.toSnakeCase(Object.assign({}, userData, append));

  delete output._id;
  delete output.oid;
  delete output.created_at;
  delete output.updated_at;

  return output;
}

function unmarshal(userData, append) {
  return Util.toCamelCase(Object.assign({}, userData, append));
}

// Define exports

exports.valid = function(req) {
  return req.method === 'OPTIONS' || Session.exists(req);
};

exports.consume = Co.wrap(function* (req, res, userInfo) {
  let user = yield User.find({ email: userInfo.email });
  const oid = userInfo.oid;
  const auth = yield Session.getRoot().getAuth();
  if (!user) {
    const password = User.password();
    const userObj = yield API.user.create({ data: marshal(userInfo, { password }) }, { auth });
    user = yield new User(unmarshal(userObj, { oid, password })).insert();
  } else {
    const userObj = yield API.user.update({ data: marshal(user, userInfo) }, { auth });
    user = yield user.set(unmarshal(userObj, { oid })).update();
  }

  const session = yield Session.create(req, user);

  session.state(res);
});
