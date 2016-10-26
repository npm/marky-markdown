var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var cheerio = require('cheerio')

describe('html-headings', function () {
  var $

  before(function () {
    $ = cheerio.load(marky(fixtures.htmlheading))
  })

  it('preserves the header tags', function () {
    assert.equal($('h1').text(), 'there')
    assert(~$('h2'))
    assert.equal($('h3').text(), 'hello')
  })

  it('wraps the blocks in <p> tags', function () {
    assert.equal($('p').length, 2)
    assert.notEqual($('p a[href=a]').length, 0)
    assert.notEqual($('p a[href=b]').length, 0)
    assert.notEqual($('p a[href=c]').length, 0)
    assert.notEqual($('p a[href=d]').length, 0)
  })
})
