module.exports = {
  extends: ['airbnb-base'],
  env: {
    node: true,
    es6: true,
    mongo: true
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 6,
    ecmaFeatures: {
      impliedStrict: true
    }
  },
  rules: {
    'no-console': 'error',
    'comma-dangle': ['error', 'never'],
    'no-underscore-dangle': ['error', { allow: ['_id', '__v'] }],
    // Line length
    'max-len': ['error', 120, 2, { ignoreComments: false }],
    // Functions
    'func-names': ['error', 'never'],
    'arrow-parens': ['error', 'always'],
    'space-before-function-paren': ['error', 'never'],
    'no-param-reassign': ['error', { props: false }]
  }
};
