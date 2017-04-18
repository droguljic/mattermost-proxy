// Define exports

module.exports = {
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
          create: { method: 'POST', url: '/users/create' },
          login: { method: 'POST', url: '/users/login' }
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
    system: {}
  }
};
