// Define exports

module.exports = {
  auth: {
    oidc: {
      provider: {
        issuer: 'https://staging.learn-nexus.nd.edu/oauth2',
        authorization_endpoint: 'https://staging.learn-nexus.nd.edu/oauth2/authorize',
        token_endpoint: 'https://staging.learn-nexus.nd.edu/oauth2/access_token',
        userinfo_endpoint: 'https://staging.learn-nexus.nd.edu/oauth2/user_info'
      },
      client: {
        client_id: 'e39ca3ad958a4ad1306f',
        grant_types: ['authorization_code'],
        id_token_signed_response_alg: 'HS256'
      }
    }
  }
};
