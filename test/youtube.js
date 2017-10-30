/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var cheerio = require('cheerio')

describe('youtube', function () {
  var $
  var iframes

  before(function () {
    $ = cheerio.load(marky(fixtures.basic, {allowDeprecatedYoutubeEmbeds: true}))
    iframes = $('.youtube-video > iframe')
  })

  it('wraps iframes in a div for stylability', function () {
    assert(!~fixtures.basic.indexOf('youtube-video'))
    assert.equal(iframes.length, 2)
  })

  it('removes iframe width and height properties', function () {
    var iframe = iframes.eq(0)
    assert.equal(iframe.attr('width'), null)
    assert.equal(iframe.attr('height'), null)
  })

  it('preserves existing src, frameborder, and allowfullscreen properties', function () {
    var iframe = iframes.eq(0)
    assert.equal(iframe.attr('src'), '//www.youtube.com/embed/3I78ELjTzlQ')
    assert.equal(iframe.attr('frameborder'), '0')
    assert.equal(iframe.attr('allowfullscreen'), '')
  })

  it('preserves full src, does not add missing frameborder and allowfullscreen attributes', function () {
    var iframe2 = iframes.eq(1)
    assert.equal(iframe2.attr('src'), 'https://www.youtube.com/embed/DN4yLZB1vUQ')
    assert.equal(typeof iframe2.attr('frameborder'), 'undefined')
    assert.equal(typeof iframe2.attr('allowfullscreen'), 'undefined')
  })
})
