/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var cheerio = require('cheerio')

describe('youtube', function () {
  var $
  var iframes

  before(function () {
    $ = cheerio.load(marky(fixtures.basic))
    iframes = $('.youtube-video > iframe')
  })

  it('wraps iframes in a div for stylability', function () {
    assert(!~fixtures.basic.indexOf('youtube-video'))
    assert.equal(iframes.length, 1)
  })

  it('removes iframe width and height properties', function () {
    var iframe = iframes.eq(0)
    assert.equal(iframe.attr('width'), null)
    assert.equal(iframe.attr('height'), null)
  })

  it('preserves existing src, frameborder, and allowfullscreen properties', function () {
    var iframe = iframes.eq(0)
    assert.equal(
      iframe.attr('src'),
      'https://www.youtube.com/embed/DN4yLZB1vUQ'
    )
    assert.equal(iframe.attr('frameborder'), '0')
    assert.equal(iframe.attr('allowfullscreen'), '')
  })
})
