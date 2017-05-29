// Define exports

module.exports = {
  auth: {
    oidc: {
      provider: {
        issuer: 'http://notredame.edxinstances.org/oauth2',
        authorizationEndpoint: 'http://notredame.edxinstances.org/oauth2/authorize',
        tokenEndpoint: 'http://notredame.edxinstances.org/oauth2/access_token',
        userinfoEndpoint: 'http://notredame.edxinstances.org/oauth2/user_info'
      },
      client: {
        clientId: '4188d01b14ed512d4e35',
        grantTypes: ['authorization_code'],
        idTokenSignedResponseAlg: 'HS256'
      }
    }
  }
};
