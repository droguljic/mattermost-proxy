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
      ignore: [
        '/login',
        '/**/system/ping',
        '/**/users/initial_load',
        '/**/users/login',
        '/**/users/create',
        '/favicon*',
        '/**/*.js',
        '/**/*.js.map',
        '/**/*.png',
        '/**/*.woff2'
      ],
      forbid: ['/signup_user_complete', '/signup_email', '/reset_password', '/**/users/send_password_reset']
    }
  },
  auth: {
    destination: {
      cookie: { name: 'hnsh' }
    },
    oidc: {
      callback: { pathname: '/auth/oidc/complete' },
      client: { grant_types: ['authorization_code'] },
      authParams: { scope: 'openid profile email' },
      cookie: { name: 'mpdcsn' }
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
