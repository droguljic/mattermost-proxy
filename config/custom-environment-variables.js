// Define exports

module.exports = {
  host: 'MP_HOST',
  port: 'MP_PORT',
  proxy: {
    target: {
      host: 'MP_TARGET_HOST',
      port: 'MP_TARGET_PORT'
    }
  },
  auth: {
    destination: {
      cookie: { name: 'MP_AUTH_DEST_CN' }
    },
    oidc: {
      client: { clientSecret: 'MP_AUTH_OIDC_CS' },
      authParams: { redirectUri: 'MP_AUTH_OIDC_RDURI' },
      cookie: { name: 'MP_AUTH_OIDC_CN' }
    }
  },
  datastore: {
    mongo: {
      main: { uri: 'MP_MDB_MAIN_URI' }
    }
  },
  mattermost: {
    system: {
      cors: { origins: 'MP_MMS_CORS_ORIGINS' },
      credentials: { destination: 'MP_MMS_CREDS_DEST' }
    }
  },
  iron: { password: 'MP_IRON_PASSWD' }
};
