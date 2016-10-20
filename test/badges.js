/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var cheerio = require('cheerio')

describe('badges', function () {
  var $

  before(function () {
    $ = cheerio.load(marky(fixtures.badges))
  })

  it('adds a badge class to img tags containing badge images', function () {
    assert($('img').length)
    assert($('img:not(.badge)').length)
    assert.equal($('img').length, $('img.badge').length + $('img:not(.badge)').length)
  })

  it('adds a badge-only class to p tags containing nothing more than a badge', function () {
    assert.equal($('p:not(.badge-only)').length, 4)
    assert.equal($('p.badge-only').length, $('p').length - 4)
  })
})
