/* globals describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var intercept = require('intercept-stdout')

describe('marky-markdown', function () {
  it('is a function', function () {
    assert(marky)
    assert(typeof marky === 'function')
  })

  it('accepts a markdown string and returns a cheerio DOM object', function () {
    var $ = marky('hello, world')
    assert($.html)
    assert($._root)
    assert($._options)
    assert(~$.html().indexOf('<p>hello, world</p>\n'))
  })

  it('throws an error if first argument is not a string', function () {
    assert.throws(
      function () { marky(null) },
      /first argument must be a string/
    )
  })
})

describe('fixtures', function () {
  it('is a key-value object', function () {
    assert(fixtures)
    assert(typeof fixtures === 'object')
    assert(!Array.isArray(fixtures))
  })

  it('contains stringified markdown files as values', function () {
    var keys = Object.keys(fixtures)
    assert(keys.length)
    keys.forEach(function (key) {
      assert(fixtures[key])
      if (key === 'dependencies' || key === 'examples') return
      assert(typeof fixtures[key] === 'string')
    })
  })

  it('has a property that is an alphabetical list of dependencies', function () {
    assert(Array.isArray(fixtures.dependencies))
    assert(fixtures.dependencies.length)
  })

  it('has a property that is an alphabetical list of saved examples', function () {
    assert(Array.isArray(fixtures.examples))
    assert(fixtures.examples.length)
  })

  it('includes some real package readmes right from node_modules', function () {
    assert(fixtures['lodash.defaults'].length)
    assert(fixtures['property-ttl'].length)
    assert(fixtures['sanitize-html'].length)
  })

  it('includes some real package readmes in static fixtures', function () {
    assert(fixtures.async.length)
    assert(fixtures.express.length)
    assert(fixtures['johnny-five'].length)
  })
})

describe('debug', function () {
  it('produces the same output in debug mode as in normal mode', function () {
    // drop anything going to stdout (so we don't wreck mocha's console output)
    var unhookIntercept = intercept(function () { return '' })

    var $ = marky(fixtures.benchmark)
    var debug = marky(fixtures.benchmark, {debug: true})
    assert.equal($.html(), debug.html())

    unhookIntercept()
  })
})
