// Load modules

const defer = require('config/defer').deferConfig;

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
  },
  mattermost: {
    api: {
      base: defer((cfg) => `http://${cfg.proxy.target.host}:${cfg.proxy.target.port}/api/v3`),
      endpoint: {
        system: {
          ping: { baseURL: defer((cfg) => `http://${cfg.proxy.target.host}:${cfg.proxy.target.port}/api/v4`) },
          getConfig: { baseURL: defer((cfg) => `http://${cfg.proxy.target.host}:${cfg.proxy.target.port}/api/v4`) },
          updateConfig: { baseURL: defer((cfg) => `http://${cfg.proxy.target.host}:${cfg.proxy.target.port}/api/v4`) }
        }
      }
    }
  }
};
