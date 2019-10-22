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
    assert.strictEqual(iframes.length, 2)
  })

  it('removes iframe width and height properties', function () {
    var iframe = iframes.eq(0)
    assert.strictEqual(iframe.attr('width'), null)
    assert.strictEqual(iframe.attr('height'), null)
  })

  it('preserves existing src, frameborder, and allowfullscreen properties', function () {
    var iframe = iframes.eq(0)
    assert.strictEqual(iframe.attr('src'), 'https://www.youtube.com/embed/3I78ELjTzlQ')
    assert.strictEqual(iframe.attr('frameborder'), '0')
    assert.strictEqual(iframe.attr('allowfullscreen'), '')
  })

  it('preserves full src, does not add missing frameborder and allowfullscreen attributes', function () {
    var iframe2 = iframes.eq(1)
    assert.strictEqual(iframe2.attr('src'), 'https://www.youtube.com/embed/DN4yLZB1vUQ')
    assert.strictEqual(typeof iframe2.attr('frameborder'), 'undefined')
    assert.strictEqual(typeof iframe2.attr('allowfullscreen'), 'undefined')
  })
})
