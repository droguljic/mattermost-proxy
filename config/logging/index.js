// Load modules

const RootLogger = require('./Bunyan').RootLogger;

// Internal logic

const store = {};

// Define exports

exports.get = function(name) {
  const upperName = name ? name.toUpperCase() : '';
  if (!upperName || upperName === 'ROOT') {
    return RootLogger;
  }

  if (store[upperName]) {
    return store[upperName];
  }

  store[upperName] = RootLogger.child({
    child: upperName
  });

  return store[upperName];
};
