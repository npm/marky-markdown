/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var cheerio = require('cheerio')

describe('html-headings', function () {
  var $

  describe('structure', function () {
    before(function () {
      $ = cheerio.load(marky(fixtures.htmlheading))
    })

    it('preserves the header tags', function () {
      var headers = $('h1')
      assert(headers.length > 4)
      var values = ['hello', 'there', 'one space', 'two spaces', 'three spaces']
      for (var i = 0; i < values.length; i++) {
        assert.equal(headers[i].children[1].data, values[i])
      }
    })

    it('wraps the blocks in <p> tags', function () {
      assert.notEqual($('p a[href=a]').length, 0)
      assert.notEqual($('p a[href=b]').length, 0)
      assert.notEqual($('p a[href=c]').length, 0)
      assert.notEqual($('p a[href=d]').length, 0)
    })

    it('ignores up to three spaces', function () {
      assert($('h1').length === 5)
    })

    it('treats four spaces as code block', function () {
      assert.equal($('h3').length, 0)
      assert.equal($('pre > code').length, 1)
    })
  })
})
