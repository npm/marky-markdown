/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var cheerio = require('cheerio')

describe('html-headings', function () {
  var $

  describe('structure', function () {
    before(function () {
      $ = cheerio.load(marky(fixtures.htmlheading))
    })

    it('preserves the header tags', function () {
      assert.equal($('h1').length, 5)
    })

    it('wraps the blocks in <p> tags', function () {
      assert.notEqual($('p a[href=a]').length, 0)
      assert.notEqual($('p a[href=b]').length, 0)
      assert.notEqual($('p a[href=c]').length, 0)
      assert.notEqual($('p a[href=d]').length, 0)
    })

    it('ignores up to three spaces', function () {
      assert($('h1').length === 5)
    })

    it('treats four spaces as code block', function () {
      assert.equal($('h3').length, 0)
      assert.equal($('pre > code').length, 1)
    })
  })

  describe('tags', function () {
    it('injects hashy anchor tags into headings that have DOM ids', function () {
      assert(~fixtures.htmlheading.indexOf('<h1>one space</h1>'))
      assert($("h1 a[href='#one-space']").length)
    })

    it('adds anchor class to added heading links', function () {
      assert(~fixtures.htmlheading.indexOf('<h1>one space</h1>'))
      assert($("h1 a.anchor[href='#one-space']").length)
    })

    it('adds aria-hidden=true to added heading links', function () {
      assert(~fixtures.htmlheading.indexOf('<h1>one space</h1>'))
      assert($("h1 a.anchor[aria-hidden='true']").length)
    })

    it("doesn't inject links into headings that already contain markdown links", function () {
      assert(~fixtures.htmlheading.indexOf('[hello](/already/linky)'))
      assert($("h1 a[href='/already/linky']").length)
    })

    it("doesn't inject links into headings that already contain inline HTML links", function () {
      assert(~fixtures.htmlheading.indexOf('<a href="/already/inline/linky">there</a>'))
      assert($("h1 a[href='/already/inline/linky']").length)
    })

    it("doesn't inject links into headings that contain internal inline HTML links", function () {
      assert(~fixtures.htmlheading.indexOf('<a href="/internal/inline/linky">link</a>'))
      assert($("h1 a[href='/internal/inline/linky']").length)
    })

    it('applies a prefix to generated DOM ids by default', function () {
      assert(~fixtures.htmlheading.indexOf('<h1>one space</h1>'))
      assert.equal($('h1 a#user-content-one-space').length, 1)
    })

    it('allows id prefixes to be disabled with prefixHeadingIds', function () {
      assert(~fixtures.htmlheading.indexOf('<h1>one space</h1>'))
      $ = cheerio.load(marky(fixtures.htmlheading, {prefixHeadingIds: false}))
      assert.equal($('h1 a#one-space').length, 1)
    })

    it('puts icons inside the generated heading links', function () {
      assert(!!$('a.anchor svg').length)
    })

    it("allows generated links' icons to be disabled", function () {
      $ = cheerio.load(marky(fixtures.htmlheading, {enableHeadingLinkIcons: false}))
      assert.equal($('a.anchor svg').length, 0)
    })
  })
})
