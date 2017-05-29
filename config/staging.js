// Define exports

module.exports = {
  auth: {
    oidc: {
      provider: {
        issuer: 'https://staging.learn-nexus.nd.edu/oauth2',
        authorizationEndpoint: 'https://staging.learn-nexus.nd.edu/oauth2/authorize',
        tokenEndpoint: 'https://staging.learn-nexus.nd.edu/oauth2/access_token',
        userinfoEndpoint: 'https://staging.learn-nexus.nd.edu/oauth2/user_info'
      },
      client: {
        clientId: 'e39ca3ad958a4ad1306f',
        grantTypes: ['authorization_code'],
        idTokenSignedResponseAlg: 'HS256'
      }
    }
  }
};
