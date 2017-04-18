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
    oidc: {
      client: {
        client_secret: 'MP_AUTH_OIDC_CS'
      }
    }
  },
  datastore: {
    mongo: {
      main: {
        uri: 'MP_MDB_MAIN_URI'
      }
    }
  },
  iron: {
    password: 'MP_IRON_PASSWD'
  }
};
