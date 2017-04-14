// Load modules

const Assert = require('assert');
const EventEmitter = require('events');

const Co = require('co');
const Config = require('config');
const VError = require('verror');

const Api = require('./Api');
const Log = require('../../config/logging').get('MATTERMOST_SYSTEM');
const Session = require('./Session');
const User = require('./User');

// Internal logic

const SYSTEM_USERNAME = 'root';
const SYSTEM_EMAIL = 'root@nd.edu';
const READY_TIMEOUT = 2; // In seconds

const getOrCreateCredentials = Co.wrap(function* (credentials, first = true) {
  if (credentials && credentials.login_id && credentials.password) {
    return { login_id: credentials.id, password: credentials.password };
  }

  const email = (credentials ? credentials.email : '') || SYSTEM_EMAIL;
  const username = (credentials ? credentials.username : '') || SYSTEM_USERNAME;
  let root = yield User.find({ username, root: true });
  if (root) {
    return root;
  }

  const password = User.password();
  const load = yield Api.user.initialLoad();
  if (!load.no_accounts) {
    if (first) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          getOrCreateCredentials(credentials, false).then(resolve).catch(reject);
        }, 1000);
      });
    }

    throw new Error('Root credentials already created but not provided');
  }

  const user = yield Api.user.create({
    data: { email, username, password },
    params: { d: 'undefined' }
  }, { authorize: false });

  root = yield new User(Object.assign(user, { password, root: true })).insert();

  return root;
});

const getConfig = Co.wrap(function* (session) {
  let config = yield Api.system.getConfig({ auth: session.token });
  if (!config.TeamSettings.EnableOpenServer) {
    const data = Object.assign({}, config);
    data.TeamSettings.EnableOpenServer = true;

    config = yield Api.system.updateConfig({ data }, { auth: session.token });
  }

  return config;
});

const onReady = Co.wrap(function* (callback, count = 1) {
  try {
    yield Api.system.ping();
  } catch (err) {
    const num = count > 7 ? 1 : count;
    const timeout = Math.pow(READY_TIMEOUT, num) * 1000; // eslint-disable-line no-restricted-properties
    setTimeout(() => onReady(callback, num + 1), timeout);

    return;
  }

  callback();
});

class System extends EventEmitter {

  constructor(settings) {
    super();
    this.settings = settings;
    this.started = false;
  }

  setup() {
    Assert.ok(!this.started, 'Cannot start Mattermost system multiple times');
    Co.call(this, function* () {
      try {
        const credentials = yield getOrCreateCredentials(this.settings.credentials);
        const session = yield Session.createRoot(credentials);
        const config = yield getConfig(session);
        const webSessionDuration = config.ServiceSettings.SessionLengthWebInDays * 24 * 60 * 60; // To seconds
        Session.setDuration(webSessionDuration);
        Log.info('Successfully started Mattermost system');
        this.started = true;
        this.emit('ready');
      } catch (err) {
        this.emit('error', new VError(err, 'Failed to start Mattermost system'));
      }
    });
  }

  start() {
    onReady(() => this.setup());
  }
}

// Define exports

module.exports = new System(Config.get('mattermost.system'));
