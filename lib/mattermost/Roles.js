// Internal logic

const PROFESSOR_GROUP = 'professors';

// Define exports

module.exports = Object.freeze({
  TEAM_ADMIN: 'team_admin',
  TEAM_USER: 'team_user',
  getTeamRoles(userInfo) {
    return userInfo.isStaff && (userInfo.groups || []).includes(PROFESSOR_GROUP)
      ? module.exports.TEAM_ADMIN : module.exports.TEAM_USER;
  }
});
