/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var cheerio = require('cheerio')

describe('when package repo is on github', function () {
  var $
  var $short
  var pkg = {
    name: 'wahlberg',
    repository: {
      type: 'git',
      url: 'https://github.com/mark/wahlberg'
    }
  }
  var shortPkg = {
    name: 'wahlberg',
    repository: 'mark/wahlberg'
  }

  before(function () {
    $ = cheerio.load(marky(fixtures.github, {package: pkg}))
    $short = cheerio.load(marky(fixtures.github, {package: shortPkg}))
  })

  it('rewrites relative link hrefs to absolute', function () {
    assert(~fixtures.github.indexOf('(relative/file.js)'))
    assert($("a[href='https://github.com/mark/wahlberg/blob/HEAD/relative/file.js']").length)
    assert($short("a[href='https://github.com/mark/wahlberg/blob/HEAD/relative/file.js']").length)
  })

  it('rewrites relative link hrefs to absolute (HTML)', function () {
    assert(~fixtures.github.indexOf('<a href="html-page.html">'))
    assert(~fixtures.github.indexOf('<a href="html-page-and-image.html">'))
    assert($("a[href='https://github.com/mark/wahlberg/blob/HEAD/html-page.html']").length)
    assert($("a[href='https://github.com/mark/wahlberg/blob/HEAD/html-page-and-image.html']").length)
    assert($short("a[href='https://github.com/mark/wahlberg/blob/HEAD/html-page.html']").length)
    assert($short("a[href='https://github.com/mark/wahlberg/blob/HEAD/html-page-and-image.html']").length)
  })

  it('rewrites slashy relative links hrefs to absolute', function () {
    assert(~fixtures.github.indexOf('(/slashy/poo)'))
    assert($("a[href='https://github.com/mark/wahlberg/blob/HEAD/slashy/poo']").length)
    assert($short("a[href='https://github.com/mark/wahlberg/blob/HEAD/slashy/poo']").length)
  })

  it('rewrites slashy relative links hrefs to absolute (HTML)', function () {
    assert(~fixtures.github.indexOf('<a href="nested/link/image">'))
    assert(~fixtures.github.indexOf('<a href="html/block.html">Link in an HTML block</a>'))
    assert($("a[href='https://github.com/mark/wahlberg/blob/HEAD/nested/link/image']").length)
    assert($("a[href='https://github.com/mark/wahlberg/blob/HEAD/html/block.html']").length)
    assert($short("a[href='https://github.com/mark/wahlberg/blob/HEAD/nested/link/image']").length)
    assert($short("a[href='https://github.com/mark/wahlberg/blob/HEAD/html/block.html']").length)
  })

  it('leaves protocol-relative URLs alone', function () {
    assert(~fixtures.github.indexOf('(//protocollie.com)'))
    assert($("a[href='//protocollie.com']").length)
    assert($short("a[href='//protocollie.com']").length)
  })

  it('leaves hashy URLs alone', function () {
    assert(~fixtures.github.indexOf('(#header)'))
    assert($("a[href='#header']").length)
    assert($short("a[href='#header']").length)
  })

  it('replaces relative img URLs with github URLs', function () {
    assert(~fixtures.github.indexOf('![](relative.png)'))
    assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/HEAD/relative.png']").length)
    assert($short("img[src='https://raw.githubusercontent.com/mark/wahlberg/HEAD/relative.png']").length)
  })

  it('replaces relative img URLs with github URLs (HTML)', function () {
    assert(~fixtures.github.indexOf('<img src="html-image.png">'))
    assert(~fixtures.github.indexOf('<img src="html-page-and-image.png" alt="alt text">'))
    assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/HEAD/html-image.png']").length)
    assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/HEAD/html-page-and-image.png']").length)
    assert($short("img[src='https://raw.githubusercontent.com/mark/wahlberg/HEAD/html-image.png']").length)
    assert($short("img[src='https://raw.githubusercontent.com/mark/wahlberg/HEAD/html-page-and-image.png']").length)
  })

  it('replaces relative img URLs with github URLs (HTML, multiline)', function () {
    var src = "<p>\n<img src='html-image.png'/>\n</p>"
    var $$ = cheerio.load(marky(src, {package: pkg}))
    var $$short = cheerio.load(marky(src, {package: shortPkg}))
    assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/HEAD/html-image.png']").length)
    assert($$short("img[src='https://raw.githubusercontent.com/mark/wahlberg/HEAD/html-image.png']").length)
    assert.equal(-1, $$.html().indexOf('<p></p>'))
    assert.equal(-1, $$short.html().indexOf('<p></p>'))
  })

  it('replaces slashy relative img URLs with github URLs', function () {
    assert(~fixtures.github.indexOf('![](/slashy/deep.png)'))
    assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/HEAD/slashy/deep.png']").length)
    assert($short("img[src='https://raw.githubusercontent.com/mark/wahlberg/HEAD/slashy/deep.png']").length)
  })

  it('replaces slashy relative img URLs with github URLs (HTML)', function () {
    assert(~fixtures.github.indexOf('<img src="nested/link/image/image.png">'))
    assert(~fixtures.github.indexOf('<img src="html/block.png" />'))
    assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/HEAD/nested/link/image/image.png']").length)
    assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/HEAD/html/block.png']").length)
    assert($short("img[src='https://raw.githubusercontent.com/mark/wahlberg/HEAD/nested/link/image/image.png']").length)
    assert($short("img[src='https://raw.githubusercontent.com/mark/wahlberg/HEAD/html/block.png']").length)
  })

  it('leaves protocol relative URLs alone', function () {
    assert(~fixtures.github.indexOf('![](//protocollie.com/woof.png)'))
    assert($("img[src='//protocollie.com/woof.png']").length)
    assert($short("img[src='//protocollie.com/woof.png']").length)
  })

  it('leaves HTTPS URLs alone', function () {
    assert(~fixtures.github.indexOf('![](https://secure.com/good.png)'))
    assert($("img[src='https://secure.com/good.png']").length)
    assert($short("img[src='https://secure.com/good.png']").length)
  })

  it('survives a falsy repository.url', function () {
    var errorPkg = {
      name: 'wahlberg',
      repository: {
        type: 'git',
        url: undefined
      }}
    assert(marky(fixtures.github, {package: errorPkg}).length)

    errorPkg.url = null
    assert(marky(fixtures.github, {package: errorPkg}).length)

    errorPkg.url = ''
    assert(marky(fixtures.github, {package: errorPkg}).length)
  })

  it('handles subdirectories in repository.url', function () {
    var errorPkg = {
      name: 'wahlberg',
      repository: {
        type: 'git',
        url: 'https://github.com/mark/wahlberg/tree/master/subdir'
      }}
    var $ = cheerio.load(marky(fixtures.github, { package: errorPkg }))

    assert(~fixtures.github.indexOf('(relative/file.js)'))
    assert($("a[href='https://github.com/mark/wahlberg/tree/master/subdir/relative/file.js']").length)

    assert(~fixtures.github.indexOf('(/slashy/poo)'))
    assert($("a[href='https://github.com/mark/wahlberg/tree/master/slashy/poo']").length)
  })
})
