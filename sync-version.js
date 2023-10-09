const ROOT_VERSION = require('./package.json').version;
const DEST_PATHS = [
  require.resolve('./projects/ngx-sails/package.json')
];
try {
  DEST_PATHS.push(
    require.resolve('./dist/ngx-sails/package.json')
  )
} catch (e) {
}

const {promises: fs} = require('node:fs');

Promise
  .all(
    DEST_PATHS
      .map(async p => {
        const json = JSON.parse(await fs.readFile(p, 'utf8'));
        if (json.version !== ROOT_VERSION) {
          json.version = ROOT_VERSION;
          const contents = JSON.stringify(json, null, 2).trim() + '\n';
          await fs.writeFile(p, contents);
        }
      })
  )
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
