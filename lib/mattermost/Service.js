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
    userTeams = yield API.user.teams({ pathParams: { user_id: user.id } }, { auth: userAuth });
  }

  const roles = Roles.getTeamRoles(userInfo);
  for (let i = 0; i < names.length; i++) { // eslint-disable-line no-plusplus
    const name = names[i];
    const status = yield API.team.exists({ pathParams: { name } }, { auth: rootAuth });
    if (!status.exists && roles === Roles.TEAM_ADMIN) {
      yield API.team.create({ data: { name, display_name: name, type: 'I' } }, { auth: userAuth });
    } else if (status.exists && !userTeams.some((ut) => ut.name === name)) {
      const team = yield API.team.getByName({ pathParams: { name } }, { auth: rootAuth });
      yield API.team.addUser({
        pathParams: { team_id: team.id },
        params: { invite_id: team.invite_id },
        data: { team_id: team.id, user_id: user.id, roles }
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
  const rootAuth = yield Session.getRoot().getAuth();
  if (!user) {
    const password = User.password();
    const userObj = yield API.user.create({ data: Object.assign(userInfo, { password }) }, { auth: rootAuth });
    user = yield new User(Object.assign(userObj, { password })).insert();
  } else {
    const userObj = yield API.user.update({ data: Object.assign({}, user, userInfo) }, { auth: rootAuth });
    user = yield user.set(userObj).update();
  }

  const session = yield Session.create(req, user);
  const userAuth = yield session.getAuth();
  if (userInfo.image) {
    yield API.user.setImage({
      pathParams: { user_id: user.id },
      data: { image: userInfo.image }
    }, { auth: userAuth });
  }

  yield upsertTeams(user, userInfo, userAuth, rootAuth);

  session.state(res);
});
