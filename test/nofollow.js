
/* globals describe, it */

var assert = require('assert')
var marky = require('..')
var cheerio = require('cheerio')

describe('nofollow plugin', function () {
  it('adds rel=nofollow attributes to links', function () {
    var rendered = cheerio.load(marky('[link text](https://example.com/spam)'))
    assert.strictEqual(rendered('a').attr('rel'), 'nofollow')
  })

  it('respects the option to turn off nofollow', function () {
    var rendered = cheerio.load(marky('[link text](https://example.com/spam)', { nofollow: false }))
    assert.strictEqual(rendered('a').attr('rel'), undefined)
  })

  it('adds rel=nofollow attributes to html links', function () {
    var rendered = cheerio.load(marky('<a href=https://example.com/spam>link text</a>'))
    assert.strictEqual(rendered('a').attr('rel'), 'nofollow')
  })

  it('respects the option to turn off nofollow for html', function () {
    var rendered = cheerio.load(marky('<a href=https://example.com/spam>link text</a>', { nofollow: false }))
    assert.strictEqual(rendered('a').attr('rel'), undefined)
  })
})
