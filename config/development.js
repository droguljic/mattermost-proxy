// Define exports

module.exports = {
  port: 11000,
  proxy: {
    target: {
      host: 'localhost',
      port: 8065
    }
  },
  auth: {
    oidc: {
      provider: {
        issuer: 'http://localhost:3000',
        authorization_endpoint: 'http://localhost:3000/auth',
        token_endpoint: 'http://localhost:3000/token',
        userinfo_endpoint: 'http://localhost:3000/me',
        token_revocation_endpoint: 'http://localhost:3000/token/revocation',
        jwks_uri: 'http://localhost:3000/certs'
      },
      client: {
        client_id: '3831846241-mpn.oidcCLIENT',
        client_secret: 'CWA1UkSM4CI4cQONNjB4SEt8UtgHL1jEaQoT4MOYILc',
        grant_types: ['authorization_code']
      },
      authParams: { redirect_uri: 'http://localhost:11000/auth/oidc/complete' }
    }
  },
  datastore: {
    mongo: {
      main: { uri: 'mongodb://127.0.0.1:27017/mmproxy' }
    }
  },
  mattermost: {
    api: {
      base: 'http://localhost:8065/api/v3',
      endpoint: {
        system: {
          ping: { baseURL: 'http://localhost:8065/api/v4' },
          getConfig: { baseURL: 'http://localhost:8065/api/v4' },
          updateConfig: { baseURL: 'http://localhost:8065/api/v4' }
        }
      }
    }
  },
  iron: { password: 'ClEuxpvoctPDI7KyDcNmTnznQNdLxolEhyxjhhHDEAQ' }
};
