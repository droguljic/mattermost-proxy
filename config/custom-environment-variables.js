// Define exports

module.exports = {
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
      client: { client_secret: 'MP_AUTH_OIDC_CS' },
      authParams: { redirect_uri: 'MP_AUTH_OIDC_RDURI' },
      cookie: { name: 'MP_AUTH_OIDC_CN' }
    }
  },
  datastore: {
    mongo: {
      main: { uri: 'MP_MDB_MAIN_URI' }
    }
  },
  iron: { password: 'MP_IRON_PASSWD' }
};
