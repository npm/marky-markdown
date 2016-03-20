/* globals describe, it, before, after */

var assert = require('assert')
var cli = require('../bin/marky-markdown')
var fixtures = require('./fixtures')
var mock = require('mock-fs')

var filename = '/some/file.md'
var fileContents = fixtures.basic

describe('$ marky-markdown', function () {
  before(function () {
    var mockObj = {}
    mockObj[filename] = fileContents
    mock(mockObj)
  })

  after(function () {
    mock.restore()
  })

  describe('exported properly', function () {
    it('is specified in package.json', function () {
      assert(require('../package.json').bin === './bin/marky-markdown.js')
    })

    it('is a function', function () {
      assert(cli)
      assert(typeof cli === 'function')
    })
  })

  describe('handles options', function () {
    it("doesn't require any options", function (cb) {
      cli([filename], function (err, args) {
        assert(!err)
        cb()
      })
    })

    it('--sanitize', function (cb) {
      cli(['--sanitize', filename], function (err, args) {
        assert(!err)
        assert(args[1].sanitize)
        cb()
      })
    })

    it('--no-sanitize', function (cb) {
      cli(['--no-sanitize', filename], function (err, args) {
        assert(!err)
        assert(!args[1].sanitize)
        cb()
      })
    })

    it('--linkify', function (cb) {
      cli(['--linkify', filename], function (err, args) {
        assert(!err)
        assert(args[1].linkify)
        cb()
      })
    })

    it('--no-linkify', function (cb) {
      cli(['--no-linkify', filename], function (err, args) {
        assert(!err)
        assert(!args[1].linkify)
        cb()
      })
    })

    it('--highlight', function (cb) {
      cli(['--highlight', filename], function (err, args) {
        assert(!err)
        assert(args[1].highlightSyntax)
        cb()
      })
    })

    it('--no-highlight', function (cb) {
      cli(['--no-highlight', filename], function (err, args) {
        assert(!err)
        assert(!args[1].highlightSyntax)
        cb()
      })
    })

    it('--prefix', function (cb) {
      cli(['--prefix', filename], function (err, args) {
        assert(!err)
        assert(args[1].prefixHeadingIds)
        cb()
      })
    })

    it('--no-prefix', function (cb) {
      cli(['--no-prefix', filename], function (err, args) {
        assert(!err)
        assert(!args[1].prefixHeadingIds)
        cb()
      })
    })

    it('--cdn', function (cb) {
      cli(['--cdn', filename], function (err, args) {
        assert(!err)
        assert(args[1].serveImagesWithCDN)
        cb()
      })
    })

    it('--no-cdn', function (cb) {
      cli(['--no-cdn', filename], function (err, args) {
        assert(!err)
        assert(!args[1].serveImagesWithCDN)
        cb()
      })
    })
  })
})
