#!/usr/bin/env bash

bash -c 'cd dist/ngx-sails && npm pack';
cp dist/ngx-sails/*.tgz dist.tgz
if [[ $NPM_TOKEN ]]; then echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc; fi;
