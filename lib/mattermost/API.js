// Load modules

const Assert = require('assert');

const Axios = require('axios');
const Co = require('co');
const Config = require('config');
const FormData = require('form-data');
const ValidUrl = require('valid-url');
const VError = require('verror');

const Log = require('../../config/logging').get('MATTERMOST_API');
const Util = require('../util');

// Internal logic

const FORBIDDEN_MARSHAL_USER_KEYS = ['_id', 'oid', 'password', 'groups', 'image', 'isStaff', 'createdAt', 'updatedAt'];
const DEFAULT_REQUEST_OPTIONS = Object.freeze({
  authorize: true,
  finalize(data, message) {
    if (data) {
      message.data = Util.toSnakeCase(data);
    }

    return message;
  },
  digest(data) {
    return Util.toCamelCase(data);
  }
});

let axios;
let endpoint;

function init(options) {
  axios = Axios.create({ baseURL: options.base, timeout: 5000 });
  endpoint = options.endpoint;
}

init(Config.get('mattermost.api'));

function resolveURL(dynamicEndpoint, message) {
  const pathParams = message.pathParams;
  let url = dynamicEndpoint.url;
  Object.keys(pathParams).forEach((key) => {
    url = url.replace(new RegExp(`{${key}}`), pathParams[key]);
  });

  delete message.pathParams;

  return Object.assign({}, dynamicEndpoint, { url });
}

function addHeaders(message, headers) {
  message.headers = message.headers || {};
  Object.assign(message.headers, headers);

  return message;
}

function marshalUser(data, message) {
  const output = Object.assign({}, data);
  const props = { groups: data.groups, image: data.image };

  output.props = Object.keys(props).reduce((acc, key) => {
    if (props[key]) {
      acc[key] = JSON.stringify(props[key]);
    }

    return acc;
  }, {});

  FORBIDDEN_MARSHAL_USER_KEYS.forEach((key) => delete output[key]);

  message.data = Util.toSnakeCase(output);

  return message;
}

function unmarshalUser(data) {
  const output = Util.toCamelCase(data);
  const props = output.props;
  Object.keys(props || {}).forEach((key) => {
    props[key] = JSON.parse(props[key]);
  });

  return output;
}

const digestImage = Co.wrap(function* (image) {
  if (ValidUrl.isWebUri(image)) {
    const response = yield Axios.get(image, { responseType: 'stream' });
    return response.data;
  }

  return image;
});

const request = Co.wrap(function* (message, options) {
  const settings = Object.assign({}, DEFAULT_REQUEST_OPTIONS, options);
  if (settings.authorize) {
    Assert.ok(settings.auth, 'Cannot authorize request to Mattermost API without provided authentication');
    const token = typeof settings.auth === 'object' ? settings.auth.token : settings.auth;
    addHeaders(message, { authorization: `Bearer ${token}` });
  }

  if (typeof settings.finalize === 'function' || settings.finalize !== false) {
    yield settings.finalize(message.data, message);
  }

  try {
    const response = yield axios.request(message);
    if (typeof settings.digest === 'function' || settings.digest !== false) {
      return settings.digest(response.data, response);
    }

    return response.data;
  } catch (err) {
    if (err.response) {
      Log.error({
        response: Object.assign({}, err.response, { config: undefined, request: undefined })
      }, `Error response from Mattermost API resource ${message.method} ${message.url}`);
    }
    throw new VError(err, `Request to Mattermost API failed, ${message.method} ${message.url}`);
  }
});

// Define exports

module.exports = {
  user: {
    initialLoad(options) {
      return request(endpoint.user.initialLoad, Object.assign({ authorize: false }, options));
    },
    login(message, options) {
      return request(Object.assign({}, endpoint.user.login, message), Object.assign({ authorize: false }, options));
    },
    create(message, options) {
      return request(
        Object.assign({}, endpoint.user.create, message),
        Object.assign({ finalize: marshalUser, digest: unmarshalUser }, options)
      );
    },
    update(message, options) {
      return request(
        Object.assign({}, endpoint.user.update, message),
        Object.assign({ finalize: marshalUser, digest: unmarshalUser }, options)
      );
    },
    setImage(message, options) {
      const finalize = (data, _message) => {
        digestImage(data.image).then((image) => {
          const formData = new FormData();
          formData.append('image', image, 'image');
          _message.data = formData;
          addHeaders(_message, formData.getHeaders());

          return _message;
        });
      };

      return request(
        Object.assign({}, resolveURL(endpoint.user.setImage, message), message), Object.assign({ finalize }, options)
      );
    },
    teams(message, options) {
      return request(Object.assign({}, resolveURL(endpoint.user.teams, message), message), options);
    }
  },
  team: {
    create(message, options) {
      return request(Object.assign({}, endpoint.team.create, message), options);
    },
    getByName(message, options) {
      return request(Object.assign({}, resolveURL(endpoint.team.getByName, message), message), options);
    },
    exists(message, options) {
      return request(Object.assign({}, resolveURL(endpoint.team.exists, message), message), options);
    },
    addUser(message, options) {
      return request(Object.assign({}, resolveURL(endpoint.team.addUser, message), message), options);
    }
  },
  system: {
    ping() {
      return request(Object.assign({}, endpoint.system.ping, { timeout: 1000 }), { authorize: false });
    },
    getConfig(options) {
      return request(endpoint.system.getConfig, Object.assign({ finalize: false, digest: false }, options));
    },
    updateConfig(message, options) {
      return request(
        Object.assign({}, endpoint.system.updateConfig, message),
        Object.assign({ finalize: false, digest: false }, options)
      );
    }
  }
};
