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
    session: {
      cookie: {
        name: 'MMAUTHTOKEN',
        options: { maxAge: 30 * 24 * 60 * 60 /* 30 days */ }
      }
    }
  }
};
