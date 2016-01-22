/* globals describe, it */

var assert = require('assert')
var path = require('path')
var marky = require('..')
var fixtures = require('./fixtures')

describe('real readmes in the wild', function () {
  function parsePackages (packages, done, getPackage) {
    assert(Array.isArray(packages))
    assert(packages.length)
    packages.forEach(function (name) {
      console.log('\t' + name)
      assert(typeof fixtures[name] === 'string')
      var $ = marky(fixtures[name], {package: getPackage(name)})
      assert($.html().length > 100)

      if (name === packages[packages.length - 1]) {
        return done()
      }
    })
  }

  it('parses all saved fixture readmes', function (done) {
    parsePackages(fixtures.examples, done, function (name) {
      return {name: name}
    })
  })

  it('parses all dependency readmes', function (done) {
    parsePackages(fixtures.dependencies, done, function (name) {
      return require(path.resolve('node_modules', name, 'package.json'))
    })
  })
})
