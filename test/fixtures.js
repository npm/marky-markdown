var fs = require('fs')
var path = require('path')
var glob = require('glob')
var fixtures = {}

// Read in all the hand-written fixture files
fs.readdirSync(__dirname + '/fixtures').forEach(function (file) {
  var key = path.basename(file).replace('.md', '')
  fixtures[key] = fs.readFileSync(__dirname + '/fixtures/' + file).toString()
})

// Read in all the devDependencies readmes
fixtures.packageNames = Object.keys(require('../package.json').devDependencies)
  .concat(Object.keys(require('../package.json').dependencies))
  .sort()

fixtures.packageNames.forEach(function (name) {
  var modulePath = path.resolve('node_modules', name)

  // Find README.md, readme.md, README, readme.markdown, etc
  var readmeFilename = glob.sync('readme*', {
    nocase: true,
    cwd: modulePath
  })[0]

  var readme = fs.readFileSync(path.resolve(modulePath, readmeFilename), 'utf-8')
  fixtures[name] = readme
})

module.exports = fixtures
