# maintenance-modules

[![NPM](https://nodei.co/npm/maintenance-modules.png)](https://nodei.co/npm/maintenance-modules/)

There is no code in this module, the only thing is this README file.

This is a list of modules that are useful for maintaining or developing modules.

- https://github.com/henrikjoreteg/fixpack
- https://github.com/feross/standard
- https://github.com/maxogden/dependency-check
- https://github.com/finnp/create-module
- https://github.com/finnp/node-travisjs
- https://github.com/meandavejustice/gh-pages-deploy
- https://github.com/phuu/npm-release
- https://github.com/tjunnone/npm-check-updates
- https://github.com/zeke/npe
- https://github.com/zeke/package-json-to-readme
- https://github.com/zeke/npmwd
- https://github.com/twolfson/foundry
- https://github.com/boennemann/semantic-release

## maintenance bash scripts

```
alias patch='pre-version && npm version patch && post-version'
alias minor='pre-version && npm version minor && post-version'
alias major='pre-version && npm version major && post-version'
alias pre-version='git diff --exit-code && npm prune && npm install -q && npm test'
alias post-version='(npm run build; exit 0) && git diff --exit-code && git push && git push --tags && npm publish'
```

- https://gist.github.com/sindresorhus/8435329