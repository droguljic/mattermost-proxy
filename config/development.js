
// Define exports

module.exports = {
  port: 11000,
  auth: {
    oidc: {
      provider: {
        issuer: 'http://localhost:3000',
        authorizationEndpoint: 'http://localhost:3000/auth',
        tokenEndpoint: 'http://localhost:3000/token',
        userinfoEndpoint: 'http://localhost:3000/me',
        tokenRevocationEndpoint: 'http://localhost:3000/token/revocation',
        jwksUri: 'http://localhost:3000/certs'
      },
      client: {
        clientId: '3831846241-mpn.oidcCLIENT',
        clientSecret: 'CWA1UkSM4CI4cQONNjB4SEt8UtgHL1jEaQoT4MOYILc',
        grantTypes: ['authorization_code']
      },
      authParams: { redirectUri: 'http://localhost:11000/auth/oidc/complete' }
    }
  },
  datastore: {
    mongo: {
      main: { uri: 'mongodb://127.0.0.1:27017/mmproxy' }
    }
  },
  iron: { password: 'ClEuxpvoctPDI7KyDcNmTnznQNdLxolEhyxjhhHDEAQ' }
};
