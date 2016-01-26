/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')

describe('when package repo is NOT on github', function () {
  var $
  var pkg = {
    name: 'bitbucketberg',
    repository: {
      type: 'git',
      url: 'https://bitbucket.com/mark/bitbucketberg'
    }
  }

  before(function () {
    $ = marky(fixtures.github, {package: pkg})
  })

  it('leaves relative URLs alone', function () {
    assert(~fixtures.github.indexOf('(relative/file.js)'))
    assert($("a[href='relative/file.js']").length)
  })

  it('leaves slashy relative URLs alone', function () {
    assert(~fixtures.github.indexOf('(/slashy/poo)'))
    assert($("a[href='/slashy/poo']").length)
  })

  it('leaves protocol-relative URLs alone', function () {
    assert(~fixtures.github.indexOf('(//protocollie.com)'))
    assert($("a[href='//protocollie.com']").length)
  })

  it('leaves hashy URLs alone', function () {
    assert(~fixtures.github.indexOf('(#header)'))
    assert($("a[href='#header']").length)
  })

  it('leaves relative img alone', function () {
    assert(~fixtures.github.indexOf('![](relative.png)'))
    assert($("img[src='relative.png']").length)
  })

  it('leaves slashy relative img URLs alone', function () {
    assert(~fixtures.github.indexOf('![](/slashy/deep.png)'))
    assert($("img[src='/slashy/deep.png']").length)
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
