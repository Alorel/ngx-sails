const fs = require('fs');
const {join} = require('path');

const PKG_JSONS_TO_CHECK = [
  'projects/ngx-sails/package.json'
];

const PACKAGE_FIELDS = ['peerDependencies', 'dependencies', 'devDependencies'];

const ROOT = join(__dirname, '..');
const ROOT_PKG_JSON = require('../package.json');

function processPkgJson(pkgJsonPath) {
  try {
    pkgJsonPath = join(ROOT, pkgJsonPath);
    const parsed = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    let changed = false;

    for (const pkgField of PACKAGE_FIELDS) {
      if (parsed[pkgField]) {
        for (const pkgDependency of Object.keys(parsed[pkgField])) {
          const version = parsed[pkgField][pkgDependency];

          for (const rootField of PACKAGE_FIELDS) {
            const rootVersion = ROOT_PKG_JSON[rootField] && ROOT_PKG_JSON[rootField][pkgDependency];
            if (rootVersion && rootVersion !== version) {
              parsed[pkgField][pkgDependency] = rootVersion;
              changed = true;
            }
          }
        }
      }
    }

    if (ROOT_PKG_JSON.version !== parsed.version) {
      parsed.version = ROOT_PKG_JSON.version;
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(pkgJsonPath, JSON.stringify(parsed, null, 2) + '\n');
      console.log('Processed', pkgJsonPath);
    } else {
      console.log('Nothing to change for', pkgJsonPath);
    }
  } catch (e) {
    console.error('Error processing', pkgJsonPath);
    console.error(e);
    process.exit(1);
  }
}

PKG_JSONS_TO_CHECK.forEach(processPkgJson);

