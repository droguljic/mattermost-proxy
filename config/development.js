module.exports = {
  port: 11000,
  proxy: {
    target: {
      host: 'localhost',
      port: 9000
    }
  }
};
