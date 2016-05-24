var fs = require('fs')
var path = require('path')
var glob = require('glob')
var pkg = require('../package.json')

var fixtures = {
  dependencies: [], // our dependencies and devDependencies
  examples: [] // examples manually saved as fixtures
}

// Read in all the hand-written fixture files
fs.readdirSync(path.join(__dirname, 'fixtures')).forEach(function (file) {
  var key = path.basename(file).replace('.md', '')
  if (key !== path.basename(file)) { // skip anything lacking a .md extension
    fixtures[key] = fs.readFileSync(path.join(__dirname, 'fixtures', file)).toString()
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

  if (readmeFilename) {
    var readme = fs.readFileSync(path.resolve(modulePath, readmeFilename), 'utf-8')
    fixtures[name] = readme
  }
})

// filter out any packages that didn't have a readme
fixtures.dependencies = fixtures.dependencies.filter(function (name) {
  return !!fixtures[name]
})

// Read in all the sample readmes saved as fixtures
fs.readdirSync(path.join(__dirname, 'fixtures', 'readmes')).forEach(function (file) {
  var key = path.basename(file).replace('.md', '')
  if (key !== path.basename(file)) { // skip anything lacking a .md extension
    fixtures[key] = fs.readFileSync(path.join(__dirname, 'fixtures', 'readmes', file)).toString()
    fixtures.examples.push(key)
  }
})
fixtures.examples.sort()

module.exports = fixtures
