/* globals describe, it */
var oldkeys = Object.keys(global)

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var intercept = require('intercept-stdout')
var markdownIt = require('markdown-it')

describe('marky-markdown', function () {
  it('is a function', function () {
    assert(marky)
    assert(typeof marky === 'function')
  })

  it('accepts a markdown string and returns an HTML string', function () {
    var html = marky('hello, world')
    assert(~html.toLowerCase().indexOf('<p>hello, world</p>\n'))
  })

  it('throws an error if first argument is not a string', function () {
    assert.throws(
      function () { marky(null) },
      /first argument must be a string/
    )
  })

  it('throws an error if second argument is provided and not an object', function () {
    var err = /second argument must be an object/
    assert.throws(function () { marky('', 'no strings allowed') }, err)
    assert.throws(function () { marky('', 3) }, err)
    assert.throws(function () { marky('', ['not', 'an', 'array']) }, err)
    assert.throws(function () { marky('', null) }, err)
    assert.throws(function () { marky('', new function () { this.prop = 'no constructed instances' }()) }, err)

    assert.doesNotThrow(function () { marky('') })
    assert.doesNotThrow(function () { marky('', {}) })
  })

  it('has a getParser method', function () {
    assert(typeof marky.getParser === 'function')
  })

  it('getParser returns a markdown-it parser', function () {
    assert(marky.getParser() instanceof markdownIt)
  })

  it('getParser.render returns the same as marky.render (sanitize: true)', function () {
    var html = marky(fixtures.benchmark)
    var parserHtml = marky.getParser().render(fixtures.benchmark)
    assert.equal(html, parserHtml)
  })

  it('getParser.render returns the same as marky.render (sanitize: false)', function () {
    var html = marky(fixtures.benchmark, {sanitize: false})
    var parserHtml = marky.getParser({sanitize: false}).render(fixtures.benchmark)
    assert.equal(html, parserHtml)
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

    var normal = marky(fixtures.benchmark)
    var debug = marky(fixtures.benchmark, {debug: true})
    assert.equal(normal, debug)

    unhookIntercept()
  })
})

describe('after', function () {
  it('does not leak', function () {
    if ('deepStrictEqual' in assert) {
      assert.deepStrictEqual(Object.keys(global), oldkeys)
    } else {
      // node <= 0.12 lacks assert.deepStrictEqual(), just compare manually
      oldkeys.sort()
      var currentkeys = Object.keys(global).sort()
      assert.equal(currentkeys.length, oldkeys.length)
      currentkeys.forEach(function (key, index) {
        assert.equal(key, oldkeys[index])
      })
    }
  })
})
