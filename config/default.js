// Define exports

module.exports = {
  ignore: { paths: ['/favicon*', '/**/*.js', '/**/*.js.map'] },
  logging: {
    bunyan: {
      name: 'MM_PROXY',
      streams: [
        { level: 'debug', stream: '$stdout' },
        { level: 'error', stream: '$stderr' }
      ]
    }
  },
  snapshot: {
    cookie: { name: 'hnsh' }
  },
  auth: {
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
          create: { method: 'POST', url: '/users/create' },
          login: { method: 'POST', url: '/users/login' }
        }
      }
    },
    session: {
      duration: 10 * 24 * 60 * 60, // 10 days, in seconds
      cookie: { name: 'MMAUTHTOKEN' }
    }
  }
};
