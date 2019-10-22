/* var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var cheerio = require('cheerio')

describe('cdn', function () {
  /* describe('handles missing or empty package data', function () {
    var controlHtml

    before(function () {
      // generate a processed version with no CDN remapping, to use as a control
      controlHtml = marky(fixtures.basic)
    })

    it('skips CDN remap when lacking package data', function () {
      var options = {
        // leave package undefined
        serveImagesWithCDN: true
      }
      var html = marky(fixtures.basic, options)
      assert.strictEqual(html, controlHtml)
    })

    it('skips CDN remap when the package lacks a name', function () {
      var options = {
        package: {version: '1.0.0'},
        serveImagesWithCDN: true
      }
      var html = marky(fixtures.basic, options)
      assert.strictEqual(html, controlHtml)
    })

    it('skips CDN remap when the package lacks a version', function () {
      var options = {
        package: {name: 'foo'},
        serveImagesWithCDN: true
      }
      var html = marky(fixtures.basic, options)
      assert.strictEqual(html, controlHtml)
    })
  })

  describe('when serveImagesWithCDN is true', function () {
    var $
    var options = {
      package: {name: 'foo', version: '1.0.0'},
      serveImagesWithCDN: true
    }

    before(function () {
      $ = cheerio.load(marky(fixtures.basic, options))
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
      $ = cheerio.load(marky(fixtures.basic, options))
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
*/
