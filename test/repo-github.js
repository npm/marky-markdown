/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')

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
    $ = marky(fixtures.github, {package: pkg})
  })

  it('rewrites relative link hrefs to absolute', function () {
    assert(~fixtures.github.indexOf('(relative/file.js)'))
    assert($("a[href='https://github.com/mark/wahlberg/blob/master/relative/file.js']").length)
  })

  it('rewrites slashy relative links hrefs to absolute', function () {
    assert(~fixtures.github.indexOf('(/slashy/poo)'))
    assert($("a[href='https://github.com/mark/wahlberg/blob/master/slashy/poo']").length)
  })

  it('leaves protocol-relative URLs alone', function () {
    assert(~fixtures.github.indexOf('(//protocollie.com)'))
    assert($("a[href='//protocollie.com']").length)
  })

  it('leaves hashy URLs alone', function () {
    assert(~fixtures.github.indexOf('(#header)'))
    assert($("a[href='#header']").length)
  })

  it('replaces relative img URLs with npm CDN URLs', function () {
    assert(~fixtures.github.indexOf('![](relative.png)'))
    assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/master/relative.png']").length)
  })

  it('replaces slashy relative img URLs with npm CDN URLs', function () {
    assert(~fixtures.github.indexOf('![](/slashy/deep.png)'))
    assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/master/slashy/deep.png']").length)
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
