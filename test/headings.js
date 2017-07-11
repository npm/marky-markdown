/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var cheerio = require('cheerio')

describe('headings', function () {
  var $, $md, $html

  before(function () {
    $md = cheerio.load(marky(fixtures.dirty))
    $html = cheerio.load(marky(fixtures.htmlheading))
  })

  describe('HTML heading parsing', function () {
    it('preserves HTML header tags', function () {
      assert.equal($html('h1').length, 5)
    })

    it('wraps the blocks in <p> tags', function () {
      assert.notEqual($html('p a[href=a]').length, 0)
      assert.notEqual($html('p a[href=b]').length, 0)
      assert.notEqual($html('p a[href=c]').length, 0)
      assert.notEqual($html('p a[href=d]').length, 0)
    })

    it('ignores up to three spaces', function () {
      assert($html('h1').length === 5)
    })

    it('treats four spaces as code block', function () {
      assert.equal($html('h3').length, 0)
      assert.equal($html('pre > code').length, 1)
    })
  })

  it('injects hashy anchor tags into headings that have DOM ids', function () {
    assert(~fixtures.dirty.indexOf('# h1'))
    assert($md("h1 a[href='#h1']").length)
  })

  it('injects hashy anchor tags into headings that have DOM ids (HTML)', function () {
    assert(~fixtures.htmlheading.indexOf('<h1>one space</h1>'))
    assert($html("h1 a[href='#one-space']").length)
  })

  it('adds anchor class to added heading links', function () {
    assert(~fixtures.dirty.indexOf('# h1'))
    assert($md("h1 a.anchor[href='#h1']").length)
  })

  it('adds anchor class to added heading links (HTML)', function () {
    assert(~fixtures.htmlheading.indexOf('<h1>one space</h1>'))
    assert($html("h1 a.anchor[href='#one-space']").length)
  })

  it('adds aria-hidden attr to added heading links', function () {
    assert(~fixtures.dirty.indexOf('# h1'))
    assert($md("h1 a.anchor[aria-hidden='true']").length)
  })

  it('adds aria-hidden=true to added heading links (HTML)', function () {
    assert(~fixtures.htmlheading.indexOf('<h1>one space</h1>'))
    assert($html("h1 a.anchor[aria-hidden='true']").length)
  })

  it("doesn't inject links into headings that already contain markdown links", function () {
    assert(~fixtures.dirty.indexOf('### [h3](/already/linky)'))
    assert($md("h3 a[href='/already/linky']").length)
  })

  it("doesn't inject links into headings that already contain markdown links (HTML)", function () {
    assert(~fixtures.htmlheading.indexOf('[hello](/already/linky)'))
    assert($html("h1 a[href='/already/linky']").length)
  })

  it("doesn't inject links into headings that already contain inline HTML links", function () {
    assert(~fixtures.dirty.indexOf('### <a href="/already/inline/linky">h3</a>'))
    assert($md("h3 a[href='/already/inline/linky']").length)
  })

  it("doesn't inject links into headings that already contain inline HTML links (HTML)", function () {
    assert(~fixtures.htmlheading.indexOf('<a href="/already/inline/linky">there</a>'))
    assert($html("h1 a[href='/already/inline/linky']").length)
  })

  it("doesn't inject links into headings that contain internal inline HTML links", function () {
    assert(~fixtures.dirty.indexOf('### Heading with embedded <a href="/internal/inline/linky">link</a>'))
    assert($md("h3 a[href='/internal/inline/linky']").length)
  })

  it("doesn't inject links into headings that contain internal inline HTML links (HTML)", function () {
    assert(~fixtures.htmlheading.indexOf('<a href="/internal/inline/linky">link</a>'))
    assert($html("h1 a[href='/internal/inline/linky']").length)
  })

  it('applies a prefix to generated DOM ids by default', function () {
    assert(~fixtures.dirty.indexOf('## h2'))
    assert.equal($md('h2 a#user-content-h2').length, 1)
  })

  it('applies a prefix to generated DOM ids by default (HTML)', function () {
    assert(~fixtures.htmlheading.indexOf('<h1>one space</h1>'))
    assert.equal($html('h1 a#user-content-one-space').length, 1)
  })

  it('allows id prefixes to be disabled with prefixHeadingIds', function () {
    assert(~fixtures.dirty.indexOf('#### This is a TEST'))
    $ = cheerio.load(marky(fixtures.dirty, {prefixHeadingIds: false}))
    assert.equal($('h4 a#this-is-a-test').length, 1)
  })

  it('allows id prefixes to be disabled with prefixHeadingIds (HTML)', function () {
    assert(~fixtures.htmlheading.indexOf('<h1>one space</h1>'))
    $ = cheerio.load(marky(fixtures.htmlheading, {prefixHeadingIds: false}))
    assert.equal($('h1 a#one-space').length, 1)
  })

  it('puts icons inside the generated heading links', function () {
    assert(!!$md('a.anchor svg').length)
  })

  it('puts icons inside the generated heading links (HTML)', function () {
    assert(!!$html('a.anchor svg').length)
  })

  it("allows generated links' icons to be disabled", function () {
    $ = cheerio.load(marky(fixtures.dirty, {enableHeadingLinkIcons: false}))
    assert.equal($('a.anchor svg').length, 0)
  })

  it("allows generated links' icons to be disabled (HTML)", function () {
    $ = cheerio.load(marky(fixtures.htmlheading, {enableHeadingLinkIcons: false}))
    assert.equal($('a.anchor svg').length, 0)
  })

  it('allows a dash in generated DOM ids just like GitHub', function () {
    assert(~fixtures.github.indexOf('### heading with a - dash'))
    $ = cheerio.load(marky(fixtures.github, {prefixHeadingIds: false}))
    assert.equal($('h3 a#heading-with-a---dash').length, 1)
  })

  it('allows a trailing dash in generated DOM ids just like GitHub', function () {
    assert(~fixtures.github.indexOf('### heading with a trailing dash -'))
    $ = cheerio.load(marky(fixtures.github, {prefixHeadingIds: false}))
    assert.equal($('h3 a#heading-with-a-trailing-dash--').length, 1)
  })

  it('allows underscores in generated DOM ids like GitHub', function () {
    assert(~fixtures.github.indexOf('### heading with an _ underscore'))
    $ = cheerio.load(marky(fixtures.github, {prefixHeadingIds: false}))
    assert.equal($('h3 a#heading-with-an-_-underscore').length, 1)
  })

  it('filters periods in generated DOM ids like GitHub', function () {
    assert(~fixtures.github.indexOf('### heading with a period.txt'))
    $ = cheerio.load(marky(fixtures.github, {prefixHeadingIds: false}))
    assert.equal($('h3 a#heading-with-a-periodtxt').length, 1)
  })

  it('allows two spaces even after filtering like GitHub', function () {
    assert(~fixtures.github.indexOf('### exchange.bind_headers(exchange, routing [, bindCallback])'))
    $ = cheerio.load(marky(fixtures.github, {prefixHeadingIds: false}))
    assert.equal($('h3 a#exchangebind_headersexchange-routing--bindcallback').length, 1)
  })

  it('add suffix to duplicate generated DOM ids like GitHub', function () {
    assert(~fixtures.github.indexOf('### duplicate'))
    assert(~fixtures.github.indexOf('### duplicate('))
    assert(~fixtures.github.indexOf('### duplicate)'))
    $ = cheerio.load(marky(fixtures.github, {prefixHeadingIds: false}))
    assert.equal($('h3 a#duplicate').length, 1)
    assert.equal($('h3 a#duplicate-1').length, 1)
    assert.equal($('h3 a#duplicate-2').length, 1)
  })

  it('encodes innerHTML and removes angle brackets before generating ids', function () {
    assert(~fixtures.payform.indexOf('## Browser `<input>` Helpers'))
    $ = cheerio.load(marky(fixtures.payform, {prefixHeadingIds: false}))
    assert.equal($('h2 a#browser-input-helpers').length, 1)
    assert.equal($('h2 a#browser-input-helpers + code').length, 1)
  })

  it('allows headings to interrupt paragraphs', function () {
    var markdown = 'this is a paragraph\n# Heading text\nSome more text here\nand another line'
    $ = cheerio.load(marky(markdown, {prefixHeadingIds: false}))
    assert.equal($('h1').length, 1)
  })

  it('allows an alternative anchor class to be configured', function () {
    $ = cheerio.load(marky(fixtures.dirty, {headingAnchorClass: 'foo'}))

    assert($("h1 a.foo[href='#h1']").length)
  })

  it('allows an alternative svg class to be configured', function () {
    $ = cheerio.load(marky(fixtures.dirty, {headingSvgClass: 'batman'}))

    assert($('svg.batman').length)
  })
})
