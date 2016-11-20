/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')
var cheerio = require('cheerio')

describe('headings', function () {
  var $

  before(function () {
    $ = cheerio.load(marky(fixtures.dirty))
  })

  it('does not parse indented ATX headings as headings', function () {
    assert(~fixtures.dirty.indexOf(' # indented h1'))
    assert(~fixtures.dirty.indexOf('  ## indented h2'))
    assert(~fixtures.dirty.indexOf('   ### indented h3'))
    assert.equal($('#indented h1').length, 0)
    assert.equal($('#indented h2').length, 0)
    assert.equal($('#indented h3').length, 0)
    assert.equal($('#indented p').length, 3)
  })

  it('injects hashy anchor tags into headings that have DOM ids', function () {
    assert(~fixtures.dirty.indexOf('# h1'))
    assert($("h1 a[href='#h1']").length)
  })

  it('adds anchor class to added heading links', function () {
    assert(~fixtures.dirty.indexOf('# h1'))
    assert($("h1 a.anchor[href='#h1']").length)
  })

  it("doesn't inject links into headings that already contain markdown links", function () {
    assert(~fixtures.dirty.indexOf('### [h3](/already/linky)'))
    assert($("h3 a[href='/already/linky']").length)
  })

  it("doesn't inject links into headings that already contain inline HTML links", function () {
    assert(~fixtures.dirty.indexOf('### <a href="/already/inline/linky">h3</a>'))
    assert($("h3 a[href='/already/inline/linky']").length)
  })

  it("doesn't inject links into headings that contain internal inline HTML links", function () {
    assert(~fixtures.dirty.indexOf('### Heading with embedded <a href="/internal/inline/linky">link</a>'))
    assert($("h3 a[href='/internal/inline/linky']").length)
  })

  it('applies a prefix to generated DOM ids by default', function () {
    assert(~fixtures.dirty.indexOf('## h2'))
    assert.equal($('h2 a#user-content-h2').length, 1)
  })

  it('allows id prefixes to be disabled with prefixHeadingIds', function () {
    assert(~fixtures.dirty.indexOf('#### This is a TEST'))
    $ = cheerio.load(marky(fixtures.dirty, {prefixHeadingIds: false}))
    assert.equal($('h4 a#this-is-a-test').length, 1)
  })

  it('puts icons inside the generated heading links', function () {
    assert(!!$('a.anchor svg').length)
  })

  it("allows generated links' icons to be disabled", function () {
    $ = cheerio.load(marky(fixtures.dirty, {enableHeadingLinkIcons: false}))
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

  it('properly handles headings lacking a space between the leading #(s) and heading text', function () {
    assert(~fixtures.lazyheading.indexOf('#lazy heading'))
    $ = cheerio.load(marky(fixtures.lazyheading, {prefixHeadingIds: false}))
    assert.equal($('h1 a#lazy-heading-1').length, 1)
    assert.equal($('h2 a#lazy-heading-2').length, 1)
    assert.equal($('h3 a#lazy-heading-3').length, 1)
    assert.equal($('h4 a#lazy-heading-4').length, 1)
    assert.equal($('h5 a#lazy-heading-5').length, 1)
    assert.equal($('h6 a#lazy-heading-6').length, 1)
  })
})
