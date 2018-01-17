
/* globals describe, it */

var assert = require('assert')
var marky = require('..')
var cheerio = require('cheerio')

describe('nofollow plugin', function () {
  it('adds rel=nofollow attributes to links', function () {
    var rendered = cheerio.load(marky('[link text](https://example.com/spam)'))
    assert.equal(rendered('a').attr('rel'), 'nofollow')
  })

  it('respects the option to turn off nofollow', function () {
    var rendered = cheerio.load(marky('[link text](https://example.com/spam)', { nofollow: false }))
    assert.equal(rendered('a').attr('rel'), undefined)
  })
})
