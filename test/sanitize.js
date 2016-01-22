/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')

describe('sanitize', function () {
  var $

  before(function () {
    $ = marky(fixtures.dirty)
  })

  it('removes script tags', function () {
    assert(~fixtures.dirty.indexOf('<script'))
    assert(!$('script').length)
  })

  it('can be disabled to allow input from trusted sources', function () {
    assert(~fixtures.dirty.indexOf('<script'))
    var $ = marky(fixtures.dirty, {sanitize: false})
    assert.equal($('script').length, 1)
    assert.equal($("script[src='http://malware.com']").length, 1)
    assert.equal($("script[type='text/javascript']").length, 1)
    assert.equal($("script[charset='utf-8']").length, 1)
  })

  it('allows img tags', function () {
    assert($('img').length)
    assert.equal($('img').attr('width'), '600')
    assert.equal($('img').attr('height'), '400')
    assert.equal($('img').attr('valign'), 'middle')
    assert.equal($('img').attr('onclick'), undefined)
  })

  it('allows h1/h2/h3/h4/h5/h6 tags to preserve their dom id', function () {
    assert($('h1').attr('id'))
    assert($('h2').attr('id'))
    assert(!$('h3').attr('id'))
    assert($('h4').attr('id'))
    assert($('h5').attr('id'))
    assert($('h6').attr('id'))
  })

  it('removes classnames from elements', function () {
    assert(~fixtures.dirty.indexOf('class="xxx"'))
    assert(!$('.xxx').length)
  })

  it('allows classnames on code tags', function () {
    assert($('code.highlight').length)
  })

  it('allows the <s> strikethrough element', function () {
    assert(~fixtures.dirty.indexOf('~~orange~~'))
    assert.equal($('s').text(), 'orange')
  })

  it('disallows iframes from sources other than youtube', function () {
    var $ = marky(fixtures.basic)
    assert(~fixtures.basic.indexOf('<iframe src="//www.youtube.com/embed/3I78ELjTzlQ'))
    assert(~fixtures.basic.indexOf('<iframe src="//malware.com'))
    assert.equal($('iframe').length, 2)
    assert.equal($('iframe').eq(0).attr('src'), '//www.youtube.com/embed/3I78ELjTzlQ')
    assert.equal($('iframe').eq(1).attr('src'), 'https://www.youtube.com/embed/DN4yLZB1vUQ')
  })

  it('allows the <ins> element', function () {
    assert(~fixtures.dirty.indexOf('<ins>'))
    assert.equal($('ins').text(), 'inserted')
  })

  it('allows the <del> element', function () {
    assert(~fixtures.dirty.indexOf('<del>'))
    assert.equal($('del').text(), 'deleted')
  })

  it('allows the <sub> element', function () {
    assert(~fixtures.dirty.indexOf('<sub>'))
    assert.equal($('sub').text(), 'subscript')
  })

  it('allows the <sup> element', function () {
    assert(~fixtures.dirty.indexOf('<sup>'))
    assert.equal($('sup').text(), 'superscript')
  })
})
