/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')

describe('cdn', function () {
  describe('when serveImagesWithCDN is true', function () {
    var $
    var options = {
      package: {name: 'foo', version: '1.0.0'},
      serveImagesWithCDN: true
    }

    before(function () {
      $ = marky(fixtures.basic, options)
    })

    it('replaces relative img URLs with npm CDN URLs', function () {
      assert(~fixtures.basic.indexOf('![](relative.png)'))
      assert($("img[src='https://cdn.npm.im/foo@1.0.0/relative.png']").length)
    })

    it('replaces slashy relative img URLs with npm CDN URLs', function () {
      assert(~fixtures.basic.indexOf('![](/slashy/deep.png)'))
      assert($("img[src='https://cdn.npm.im/foo@1.0.0/slashy/deep.png']").length)
    })

    it('leaves protocol relative URLs alone', function () {
      assert(~fixtures.basic.indexOf('![](//protocollie.com/woof.png)'))
      assert($("img[src='//protocollie.com/woof.png']").length)
    })

    it('leaves HTTPS URLs alone', function () {
      assert(~fixtures.basic.indexOf('![](https://secure.com/good.png)'))
      assert($("img[src='https://secure.com/good.png']").length)
    })
  })

  describe('when serveImagesWithCDN is false (default)', function () {
    var $
    var options = {
      package: {
        name: 'foo',
        version: '1.0.0'
      }
    }

    before(function () {
      $ = marky(fixtures.basic, options)
    })

    it('leaves relative img alone', function () {
      assert(~fixtures.basic.indexOf('![](relative.png)'))
      assert($("img[src='relative.png']").length)
    })

    it('leaves slashy relative img URLs alone', function () {
      assert(~fixtures.basic.indexOf('![](/slashy/deep.png)'))
      assert($("img[src='/slashy/deep.png']").length)
    })

    it('leaves protocol relative URLs alone', function () {
      assert(~fixtures.basic.indexOf('![](//protocollie.com/woof.png)'))
      assert($("img[src='//protocollie.com/woof.png']").length)
    })

    it('leaves HTTPS URLs alone', function () {
      assert(~fixtures.basic.indexOf('![](https://secure.com/good.png)'))
      assert($("img[src='https://secure.com/good.png']").length)
    })
  })
})
