// Define exports

module.exports = {
  host: 'localhost',
  port: 9000,
  proxy: {
    target: {
      host: 'localhost',
      port: 8065
    }
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
        '/**/users/newpassword',
        '/**/users/send_password_reset'
      ],
      ignore: [
        '/login',
        '/favicon*',
        '/**/system/ping',
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
      endpoint: {
        user: {
          initialLoad: { method: 'GET', url: '/users/initial_load' },
          login: { method: 'POST', url: '/users/login' },
          create: { method: 'POST', url: '/users/create' },
          update: { method: 'POST', url: '/users/update' },
          setImage: { method: 'POST', url: '/users/{user_id}/image' },
          teams: { method: 'GET', url: '/users/{user_id}/teams' }
        },
        team: {
          create: { method: 'POST', url: '/teams' },
          getByName: { method: 'GET', url: '/teams/name/{name}' },
          exists: { method: 'GET', url: '/teams/name/{name}/exists' },
          addUser: { method: 'POST', url: '/teams/{team_id}/members' }
        },
        system: {
          ping: { method: 'GET', url: '/system/ping' },
          getConfig: { method: 'GET', url: '/config' },
          updateConfig: { method: 'PUT', url: '/config' }
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
