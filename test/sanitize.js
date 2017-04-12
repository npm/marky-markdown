/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var cheerio = require('cheerio')

describe('sanitize', function () {
  var $

  before(function () {
    $ = cheerio.load(marky(fixtures.dirty))
  })

  it('removes script tags', function () {
    assert(~fixtures.dirty.indexOf('<script'))
    assert(!$('script').length)
  })

  it('can be disabled to allow input from trusted sources', function () {
    assert(~fixtures.dirty.indexOf('<script'))
    var $ = cheerio.load(marky(fixtures.dirty, {sanitize: false}))
    assert.equal($('script').length, 1)
    assert.equal($("script[src='http://malware.com']").length, 1)
    assert.equal($("script[type='text/javascript']").length, 1)
    assert.equal($("script[charset='utf-8']").length, 1)
  })

  it('allows img tags', function () {
    assert($('img').length)
    assert.equal($('img').attr('width'), '600')
    assert.equal($('img').attr('height'), '400')
    assert.equal($('img').attr('align'), 'right')
    assert.equal($('img').attr('valign'), 'middle')
    assert.equal($('img').attr('onclick'), undefined)
  })

  it('allows h1/h2/h3/h4/h5/h6 tags to preserve their dom id', function () {
    assert($('h1[id]').length)
    assert($('h2[id]').length)
    assert($('h3[id]').length)
    assert($('h4[id]').length)
    assert($('h5[id]').length)
    assert($('h6[id]').length)
  })

  it('removes classnames from elements', function () {
    assert(~fixtures.dirty.indexOf('class="xxx"'))
    assert(!$('.xxx').length)
  })

  it('allows classnames on div tags used for syntax highlighting', function () {
    assert($('div.highlight').length)
  })

  it('allows the <s> strikethrough element', function () {
    assert(~fixtures.dirty.indexOf('~~orange~~'))
    assert.equal($('s').text(), 'orange')
  })

  it('disallows iframes from sources other than youtube', function () {
    var $ = cheerio.load(marky(fixtures.basic))
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

  it('allows the <dl> element', function () {
    assert(~fixtures.dirty.indexOf('<dl>'))
  })

  it('allows the <dt> element', function () {
    assert(~fixtures.dirty.indexOf('<dt>'))
    assert.equal($('dt').eq(0).text(), 'Term 1')
  })

  it('allows the <dd> element', function () {
    assert(~fixtures.dirty.indexOf('<dd>'))
    assert.equal($('dd').eq(0).text(), 'Definition 1')
  })

  it('allows <p> alignment', function () {
    assert(~fixtures.dirty.indexOf('<p align='))
    assert($('p[align]').length > 0)
  })

  it('allows table cell left alignment', function () {
    var html = marky(fixtures.dirty)
    assert(html.indexOf('<th style="text-align:left">') > -1)
    assert(html.indexOf('<td style="text-align:left">') > -1)
  })

  it('allows table cell right alignment', function () {
    var html = marky(fixtures.dirty)
    assert(html.indexOf('<th style="text-align:right">') > -1)
    assert(html.indexOf('<td style="text-align:right">') > -1)
  })

  it('allows table cell center alignment', function () {
    var html = marky(fixtures.dirty)
    assert(html.indexOf('<th style="text-align:center">') > -1)
    assert(html.indexOf('<td style="text-align:center">') > -1)
  })

  it('strips non-alignment table cell style', function () {
    var html = marky(fixtures.dirty)
    assert(!~html.indexOf('color:red;'))
    assert(!~html.indexOf('width: 100%;'))

    // alignment directives generated by something other than markdown-it's
    // parser might contain internal whitespace; we normalize it such that our
    // sanitized output contains none
    assert(!~html.indexOf('text-align: right'))
  })

  it('allows title attributes on images', function () {
    var title = 'Image title'
    var $ = cheerio.load(marky("![alt text](#url '" + title + "')"))
    assert.equal($('img').attr('title'), title)
  })

  it('allows title attributes on links', function () {
    var title = "You don't know npm"
    var $ = cheerio.load(marky('[link text](https://www.youtube.com/watch?v=Zqm78_27lWA "' + title + '")'))
    assert.equal($('a').attr('title'), title)
  })

  it('allows spaces in path names', function () {
    // images
    var $ = cheerio.load(marky('![Gitter](https://badges.gitter.im/Join Chat.svg)'))
    assert.equal($('img').attr('src'), 'https://badges.gitter.im/Join%20Chat.svg')
    // anchors
    $ = cheerio.load(marky('[link text](https://example.com/link me.html)'))
    assert.equal($('a').attr('href'), 'https://example.com/link%20me.html')
  })

  it('allows spaces in path names with title attributes', function () {
    // images
    var title = 'Image title'
    var $ = cheerio.load(marky('![Gitter](https://badges.gitter.im/Join Chat.svg "' + title + '")'))
    assert.equal($('img').attr('src'), 'https://badges.gitter.im/Join%20Chat.svg')
    assert.equal($('img').attr('title'), title)
    // anchors
    title = 'Link title'
    $ = cheerio.load(marky('[link text](https://example.com/link me.html "' + title + '")'))
    assert.equal($('a').attr('href'), 'https://example.com/link%20me.html')
    assert.equal($('a').attr('title'), title)
  })

  it('allows spaces in path names of images used as anchors', function () {
    var $ = cheerio.load(marky('[![Gitter](https://badges.gitter.im/Join Chat.svg)](#url)'))
    assert.equal($('img').attr('src'), 'https://badges.gitter.im/Join%20Chat.svg')
    assert.equal($('a').attr('href'), '#url')
  })

  it('allows spaces in path names when inline element is in paragraph', function () {
    var src = 'I am a paragraph. This is a [link](http://example.com/link me.html).'
    src += 'And here is an image: ![image](http://example.com/an image.png). This paragraph is now over.'
    var $ = cheerio.load(marky(src))
    assert.equal($('img').attr('src'), 'http://example.com/an%20image.png')
    assert.equal($('a').attr('href'), 'http://example.com/link%20me.html')
  })

  it('allows the <details>/<summary> elements', function () {
    var src = '# Test\n\n<details><summary>Summary here</summary>\nLong long information, War & Peace, etc...</details>\n'
    var $ = cheerio.load(marky(src))
    assert.equal($('details').length, 1)
    assert.equal($('summary').length, 1)
  })

  it('prefixes ids from user-generated html', function () {
    var $ = cheerio.load(marky('<div id="oh-no">Foo.</div>'))
    assert.equal($('div').attr('id'), 'user-content-oh-no')
  })
})
