const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

module.exports = cfg => {
  debugger;
  cfg.plugins.push(new NodePolyfillPlugin({excludeAliases: ['console']}));

  return cfg;
};
