// Load modules

const Boom = require('boom');

const Log = require('../../config/logging').get('HTTP_UTIL');

// Define exports

exports.redirect = function(res, url) {
  res.writeHead(302, {
    Location: url
  });
  res.end();
};

exports.sendError = function(err, req, res) {
  if (res.finished) {
    Log.error('Cannot send server error because response is already closed');
    return;
  }

  const output = (err.isBoom ? err : Boom.badImplementation('', err)).output;
  const accept = req.headers.accept;
  const headers = {};
  let data;
  if (accept && accept.toLowerCase().includes('application/json')) {
    headers['Content-Type'] = 'application/json';
    data = JSON.stringify(output.payload);
  } else {
    headers['Content-Type'] = 'text/plain';
    data = `${output.payload.statusCode} ${output.payload.message}`;
  }

  res.writeHead(output.statusCode, output.payload.error, headers);
  res.end(data);
};
