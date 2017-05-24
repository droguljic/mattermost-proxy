// Define exports

module.exports = {
  auth: {
    oidc: {
      provider: {
        issuer: 'http://notredame.edxinstances.org/oauth2',
        authorization_endpoint: 'http://notredame.edxinstances.org/oauth2/authorize',
        token_endpoint: 'http://notredame.edxinstances.org/oauth2/access_token',
        userinfo_endpoint: 'http://notredame.edxinstances.org/oauth2/user_info'
      },
      client: {
        client_id: '4188d01b14ed512d4e35',
        grant_types: ['authorization_code'],
        id_token_signed_response_alg: 'HS256'
      }
    }
  }
};
