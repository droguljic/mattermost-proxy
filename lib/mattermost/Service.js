// Load modules

const Co = require('co');

const API = require('./API');
const Roles = require('./Roles');
const Session = require('./Session');
const User = require('./User');

// Internal logic

const TEAM_REGEXP = /^[a-z]+[0-9]{4}$/; // Regexp to evaluate if group is a valid team

function extractTeamNames(source) {
  return (source || []).reduce((acc, grp) => {
    if (TEAM_REGEXP.test(grp)) {
      acc.push(grp);
    }

    return acc;
  }, []);
}

const upsertTeams = Co.wrap(function* (user, userInfo, userAuth, rootAuth) {
  const names = extractTeamNames(userInfo.groups);
  let userTeams;
  if (names.length) {
    userTeams = yield API.user.teams({ pathParams: { userId: user.id } }, { auth: userAuth });
  }

  const roles = Roles.getTeamRoles(userInfo);
  for (let i = 0; i < names.length; i++) { // eslint-disable-line no-plusplus
    const name = names[i];
    const status = yield API.team.exists({ pathParams: { name } }, { auth: rootAuth });
    if (!status.exists && roles === Roles.TEAM_ADMIN) {
      yield API.team.create({ data: { name, displayName: name, type: 'I' } }, { auth: userAuth });
    } else if (status.exists && !userTeams.some((ut) => ut.name === name)) {
      const team = yield API.team.getByName({ pathParams: { name } }, { auth: rootAuth });
      yield API.team.addUser({
        pathParams: { teamId: team.id },
        params: { inviteId: team.inviteId },
        data: { teamId: team.id, userId: user.id, roles }
      }, { auth: rootAuth });
    }
  }
});

// Define exports

exports.valid = function(req) {
  return req.method === 'OPTIONS' || Session.exists(req);
};

exports.consume = Co.wrap(function* (req, res, userInfo) {
  let user = yield User.find({ email: userInfo.email });
  const exists = !(user == null);
  const rootAuth = yield Session.getRoot().getAuth();
  if (!exists) {
    const password = User.password();
    const userObj = yield API.user.create({ data: Object.assign(userInfo, { password }) }, { auth: rootAuth });
    user = yield new User(Object.assign(userObj, { password })).insert();
  }

  const session = yield Session.create(req, user);
  const userAuth = yield session.getAuth(req);
  const oldImage = exists ? (user.props || {}).image : undefined; // Get image before user is updated
  if (exists) {
    const userObj = yield API.user.update({ data: Object.assign({}, user, userInfo) }, { auth: userAuth });
    user = yield user.set(userObj).update();
  }

  const newImage = userInfo.image;
  if (newImage && oldImage !== newImage) { // Only set image if it's updated
    yield API.user.setImage({ pathParams: { userId: user.id }, data: { image: newImage } }, { auth: userAuth });
  }

  yield upsertTeams(user, userInfo, userAuth, rootAuth);

  session.state(res);
});
