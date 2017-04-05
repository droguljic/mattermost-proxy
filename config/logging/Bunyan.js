// Load modules

const Bunyan = require('bunyan');
const Config = require('config');

// Internal logic

function resolve(options) {
  const settings = Object.assign({}, options);
  settings.streams = options.streams.map((el) => {
    const output = Object.assign({}, el);
    switch (el.stream) {
      case '$stdout':
        output.stream = process.stdout;
        break;
      case '$stderr':
        output.stream = process.stderr;
        break;
      default:
    }

    return output;
  });

  return settings;
}

function init(options) {
  const rootLogger = Bunyan.createLogger(resolve(options));
  rootLogger.addSerializers({ err: Bunyan.stdSerializers.err });

  return rootLogger;
}

// Declare exports

exports.RootLogger = init(Config.get('logging.bunyan'));
