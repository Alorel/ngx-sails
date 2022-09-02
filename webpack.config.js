module.exports = cfg => {
  const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');

  const resolve = cfg.resolve || (cfg.resolve = {});
  const fallback = resolve.fallback || (resolve.fallback = {});

  const modules = ['tls', 'child_process', 'net', 'fs'];
  for (const m of modules) {
    if (fallback[m] == null) {
      fallback[m] = false;
    }
  }

  (cfg.plugins || (cfg.plugins = [])).push(new NodePolyfillPlugin({excludeAliases: ['console']}));

  return cfg;
};
