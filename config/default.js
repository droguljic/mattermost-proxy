// Load modules

const defer = require('config/defer').deferConfig;

// Define exports

module.exports = {
  host: 'localhost',
  port: 9000,
  proxy: {
    target: { host: 'localhost', port: 8065 }
  },
  logging: {
    bunyan: {
      name: 'MM_PROXY',
      streams: [
        { level: 'debug', stream: '$stdout' },
        { level: 'error', stream: '$stderr' }
      ]
    }
  },
  url: {
    rules: {
      forbid: [
        '/reset_password',
        '/signup_user_complete',
        '/signup_email',
        '/**/users/create',
        { method: 'POST', url: '/**/users' },
        '/**/users/newpassword',
        '/**/users/password/reset',
        '/**/users/*/password',
        '/**/users/password/reset/send',
        '/**/users/send_password_reset'
      ],
      ignore: [
        '/login',
        '/favicon*',
        '/**/system/ping',
        '/**/config/client',
        '/**/license/client',
        '/**/users/initial_load',
        '/**/users/login',
        '/**/*.js',
        '/**/*.js.map',
        '/**/*.png',
        '/**/*.woff2'
      ]
    }
  },
  auth: {
    check: { pathname: '/proxy/auth/check' },
    destination: {
      cookie: { name: 'mpdst' }
    },
    oidc: {
      callback: { pathname: '/auth/oidc/complete' },
      client: { grant_types: ['authorization_code'] },
      authParams: { scope: 'openid profile email' },
      cookie: { name: 'mpdcsn' }
    }
  },
  datastore: {
    mongo: {
      main: { fresh: false }
    }
  },
  mattermost: {
    api: {
      base: defer((cfg) => `http://${cfg.proxy.target.host}:${cfg.proxy.target.port}`),
      endpoint: {
        user: {
          initialLoad: { method: 'GET', url: '/api/v3/users/initial_load' },
          login: { method: 'POST', url: '/api/v4/users/login' },
          create: { method: 'POST', url: '/api/v3/users/create' },
          update: { method: 'POST', url: '/api/v3/users/update' },
          setImage: { method: 'POST', url: '/api/v4/users/{userId}/image' },
          teams: { method: 'GET', url: '/api/v4/users/{userId}/teams' }
        },
        team: {
          create: { method: 'POST', url: '/api/v4/teams' },
          getByName: { method: 'GET', url: '/api/v4/teams/name/{name}' },
          exists: { method: 'GET', url: '/api/v4/teams/name/{name}/exists' },
          addUser: { method: 'POST', url: '/api/v4/teams/{teamId}/members' }
        },
        system: {
          ping: { method: 'GET', url: '/api/v4/system/ping' },
          getConfig: { method: 'GET', url: '/api/v4/config' },
          updateConfig: { method: 'PUT', url: '/api/v4/config' }
        }
      }
    },
    session: {
      cookie: { name: 'MMAUTHTOKEN' }
    },
    system: {
      cors: { origins: '' },
      credentials: {}
    }
  }
};
