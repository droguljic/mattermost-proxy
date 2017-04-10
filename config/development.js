module.exports = {
  port: 11000,
  proxy: {
    target: {
      host: 'localhost',
      port: 9000
    }
  },
  datastore: {
    mongo: {
      main: { uri: 'mongodb://127.0.0.1:27017/mmproxy' }
    }
  },
  iron: { password: 'ClEuxpvoctPDI7KyDcNmTnznQNdLxolEhyxjhhHDEAQ' }
};
