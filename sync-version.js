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

const fs = require('fs');

for (const p of DEST_PATHS) {
  const json = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (json.version !== ROOT_VERSION) {
    json.version = ROOT_VERSION;
    const contents = JSON.stringify(json, null, 2).trim() + '\n';
    fs.writeFileSync(p, contents);
  }
}
