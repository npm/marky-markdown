/* globals describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var cheerio = require('cheerio')

describe('packagize', function () {
  var packages = {
    wibble: {
      name: 'wibble',
      description: 'A package called wibble'
    },
    wobble: {
      name: 'wobble',
      description: 'wibble'
    },
    dangledor: {
      name: 'dangledor',
      description: 'dangledor need not roar'
    },
    '@burble/wibble': {
      name: '@burble/wibble',
      description: 'A package called @burble/wibble!'
    }
  }

  describe('name', function () {
    it("adds .package-name-redundant class to first h1 if it's similar to package.name", function () {
      var $ = cheerio.load(marky(fixtures.wibble, {package: packages.wibble}))
      assert.equal($('h1.package-name-redundant').length, 1)
    })

    it("adds .package-name-redundant class to first h1 if it's similar to a scoped package.name", function () {
      var $ = cheerio.load(marky(fixtures.burblewibble, {package: packages['@burble/wibble']}))
      assert.equal($('h1.package-name-redundant').length, 1)
    })

    it('leaves first h1 alone if it differs from package.name', function () {
      var $ = cheerio.load(marky(fixtures.wibble, {package: packages.dangledor}))
      assert.equal($('h1.package-name-redundant').length, 0)
      assert.equal($('h1:not(.package-name)').text(), 'wibble.js')
    })
  })

  describe('description', function () {
    it("adds .package-description-redundant class to first h1 if it's similar to package.description", function () {
      var $ = cheerio.load(marky(fixtures.wibble, {package: packages.wobble}))
      assert.equal($('h1.package-description-redundant').length, 1)
    })

    it('leaves first h1 alone if it differs from package.description', function () {
      var $ = cheerio.load(marky(fixtures.wibble, {package: packages.dangledor}))
      assert.equal($('h1.package-description-redundant').length, 0)
      assert.equal($('h1:not(.package-name)').text(), 'wibble.js')
    })

    it("adds .package-description-redundant class to first p if it's similar to package.description", function () {
      var $ = cheerio.load(marky(fixtures.wibble, {package: packages.wibble}))
      assert.equal($('p.package-description-redundant').length, 1)
    })

    it('leaves first p alone if it differs from package.description', function () {
      var $ = cheerio.load(marky(fixtures.wibble, {package: packages.dangledor}))
      assert.equal($('p.package-description-redundant').length, 0)
      assert.equal($('p:not(.package-description)').first().text(), 'A package called wibble!')
    })
  })

  describe('parsePackageDescription()', function () {
    it('is a method for parsing package descriptions', function () {
      assert.equal(typeof marky.parsePackageDescription, 'function')
    })

    it('parses description as markdown and removes script tags', function () {
      var description = marky.parsePackageDescription('bad <script>/xss</script> [hax](http://hax.com)')
      assert.equal(description, 'bad  <a href="http://hax.com">hax</a>')
    })

    it('safely handles inline code blocks', function () {
      var description = marky.parsePackageDescription('Browser `<input type="text">` Helpers')
      assert.equal(description, 'Browser <code>&lt;input type=&quot;text&quot;&gt;</code> Helpers')
    })

    it('safely handles script tags in inline code blocks', function () {
      var description = marky.parsePackageDescription('Here comes a `<script>` tag')
      assert.equal(description, 'Here comes a <code>&lt;script&gt;</code> tag')
    })
  })
})
