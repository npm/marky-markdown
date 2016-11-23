/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var cheerio = require('cheerio')

describe('when package repo is on github', function () {
  var $
  var pkg = {
    name: 'wahlberg',
    repository: {
      type: 'git',
      url: 'https://github.com/mark/wahlberg'
    }
  }

  before(function () {
    $ = cheerio.load(marky(fixtures.github, {package: pkg}))
  })

  it('rewrites relative link hrefs to absolute', function () {
    assert(~fixtures.github.indexOf('(relative/file.js)'))
    assert($("a[href='https://github.com/mark/wahlberg/blob/master/relative/file.js']").length)
  })

  it('rewrites relative link hrefs to absolute (HTML)', function () {
    assert(~fixtures.github.indexOf('<a href="html-page.html">'))
    assert(~fixtures.github.indexOf('<a href="html-page-and-image.html">'))
    assert($("a[href='https://github.com/mark/wahlberg/blob/master/html-page.html']").length)
    assert($("a[href='https://github.com/mark/wahlberg/blob/master/html-page-and-image.html']").length)
  })

  it('rewrites slashy relative links hrefs to absolute', function () {
    assert(~fixtures.github.indexOf('(/slashy/poo)'))
    assert($("a[href='https://github.com/mark/wahlberg/blob/master/slashy/poo']").length)
  })

  it('rewrites slashy relative links hrefs to absolute (HTML)', function () {
    assert(~fixtures.github.indexOf('<a href="nested/link/image">'))
    assert($("a[href='https://github.com/mark/wahlberg/blob/master/nested/link/image']").length)
  })

  it('leaves protocol-relative URLs alone', function () {
    assert(~fixtures.github.indexOf('(//protocollie.com)'))
    assert($("a[href='//protocollie.com']").length)
  })

  it('leaves hashy URLs alone', function () {
    assert(~fixtures.github.indexOf('(#header)'))
    assert($("a[href='#header']").length)
  })

  it('replaces relative img URLs with github URLs', function () {
    assert(~fixtures.github.indexOf('![](relative.png)'))
    assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/master/relative.png']").length)
  })

  it('replaces relative img URLs with github URLs (HTML)', function () {
    assert(~fixtures.github.indexOf('<img src="html-image.png">'))
    assert(~fixtures.github.indexOf('<img src="html-page-and-image.png" alt="alt text">'))
    assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/master/html-image.png']").length)
    assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/master/html-page-and-image.png']").length)
  })

  it('replaces slashy relative img URLs with github URLs', function () {
    assert(~fixtures.github.indexOf('![](/slashy/deep.png)'))
    assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/master/slashy/deep.png']").length)
  })

  it('replaces slashy relative img URLs with github URLs (HTML)', function () {
    assert(~fixtures.github.indexOf('<img src="nested/link/image/image.png">'))
    assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/master/nested/link/image/image.png']").length)
  })

  it('leaves protocol relative URLs alone', function () {
    assert(~fixtures.github.indexOf('![](//protocollie.com/woof.png)'))
    assert($("img[src='//protocollie.com/woof.png']").length)
  })

  it('leaves HTTPS URLs alone', function () {
    assert(~fixtures.github.indexOf('![](https://secure.com/good.png)'))
    assert($("img[src='https://secure.com/good.png']").length)
  })
})
