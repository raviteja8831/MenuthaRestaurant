const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function(env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  config.resolve = config.resolve || {};
  config.resolve.alias = Object.assign({}, config.resolve.alias || {}, {
    // When building for web, alias react-native-maps to our WebMapView wrapper
    'react-native-maps': path.resolve(__dirname, 'src/components/WebMapView.js'),
  });

  return config;
};
