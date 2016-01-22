var fs = require('fs')
var path = require('path')
var glob = require('glob')
var pkg = require('../package.json')

var fixtures = {
  dependencies: [], // our dependencies and devDependencies
  examples: [] // examples manually saved as fixtures
}

// Read in all the hand-written fixture files
fs.readdirSync(__dirname + '/fixtures').forEach(function (file) {
  var key = path.basename(file).replace('.md', '')
  if (key !== path.basename(file)) { // skip anything lacking a .md extension
    fixtures[key] = fs.readFileSync(__dirname + '/fixtures/' + file).toString()
  }
})

// Read in dependencies' and devDependencies' readmes
fixtures.dependencies = Object.keys(pkg.devDependencies)
  .concat(Object.keys(pkg.dependencies))
  .sort()
fixtures.dependencies.forEach(function (name) {
  var modulePath = path.resolve('node_modules', name)

  // Find README.md, readme.md, README, readme.markdown, etc
  var readmeFilename = glob.sync('readme*', {
    nocase: true,
    cwd: modulePath
  })[0]

  var readme = fs.readFileSync(path.resolve(modulePath, readmeFilename), 'utf-8')
  fixtures[name] = readme
})

// Read in all the sample readmes saved as fixtures
fs.readdirSync(__dirname + '/fixtures/readmes').forEach(function (file) {
  var key = path.basename(file).replace('.md', '')
  if (key !== path.basename(file)) { // skip anything lacking a .md extension
    fixtures[key] = fs.readFileSync(__dirname + '/fixtures/readmes/' + file).toString()
    fixtures.examples.push(key)
  }
})
fixtures.examples.sort()

module.exports = fixtures
