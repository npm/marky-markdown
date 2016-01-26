/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')

describe('headings', function () {
  var $

  before(function () {
    $ = marky(fixtures.dirty)
  })

  it('injects hashy anchor tags into headings that have DOM ids', function () {
    assert(~fixtures.dirty.indexOf('# h1'))
    assert($("h1 a[href='#h1']").length)
  })

  it('adds deep-link class to modified headings', function () {
    assert(~fixtures.dirty.indexOf('# h1'))
    assert($("h1.deep-link a[href='#h1']").length)
  })

  it("doesn't inject anchor tags into headings that already contain anchors", function () {
    assert(~fixtures.dirty.indexOf('### [h3](/already/linky)'))
    assert($("h3 a[href='/already/linky']").length)
  })

  it('applies a prefix to generated DOM ids by default', function () {
    assert(~fixtures.dirty.indexOf('## h2'))
    assert.equal($('h2#user-content-h2').length, 1)
  })

  it('allows id prefixes to be disabled with prefixHeadingIds', function () {
    assert(~fixtures.dirty.indexOf('#### This is a TEST'))
    $ = marky(fixtures.dirty, {prefixHeadingIds: false})
    assert.equal($('h4#this-is-a-test').length, 1)
  })

  it('allows a dash in generated DOM ids just like GitHub', function () {
    assert(~fixtures.github.indexOf('### heading with a - dash'))
    $ = marky(fixtures.github)
    assert.equal($('h3#heading-with-a---dash a').length, 1)
  })

  it('allows a trailing dash in generated DOM ids just like GitHub', function () {
    assert(~fixtures.github.indexOf('### heading with a trailing dash -'))
    $ = marky(fixtures.github)
    assert.equal($('h3#heading-with-a-trailing-dash-- a').length, 1)
  })

  it('allows underscores in generated DOM ids like GitHub', function () {
    assert(~fixtures.github.indexOf('### heading with an _ underscore'))
    $ = marky(fixtures.github)
    assert.equal($('h3#heading-with-an-_-underscore a').length, 1)
  })

  it('filters periods in generated DOM ids like GitHub', function () {
    assert(~fixtures.github.indexOf('### heading with a period.txt'))
    $ = marky(fixtures.github)
    assert.equal($('h3#heading-with-a-periodtxt').length, 1)
  })

  it('allows two spaces even after filtering like GitHub', function () {
    assert(~fixtures.github.indexOf('### exchange.bind_headers(exchange, routing [, bindCallback])'))
    $ = marky(fixtures.github)
    assert.equal($('h3#exchangebind_headersexchange-routing--bindcallback').length, 1)
  })

  it('add suffix to duplicate generated DOM ids like GitHub', function () {
    assert(~fixtures.github.indexOf('### duplicate'))
    assert(~fixtures.github.indexOf('### duplicate('))
    assert(~fixtures.github.indexOf('### duplicate)'))
    $ = marky(fixtures.github)
    assert.equal($('h3#duplicate a').length, 1)
    assert.equal($('h3#duplicate-1 a').length, 1)
    assert.equal($('h3#duplicate-2 a').length, 1)
  })

  it('encodes innerHTML and removes angle brackets before generating ids', function () {
    assert(~fixtures.payform.indexOf('## Browser `<input>` Helpers'))
    $ = marky(fixtures.payform, {prefixHeadingIds: false})
    assert.equal($('h2#browser-input-helpers a').length, 1)
    assert.equal($('h2#browser-input-helpers a').html(), 'Browser <code>&lt;input&gt;</code> Helpers')
  })

  it('properly handles headings lacking a space between the leading #(s) and heading text', function () {
    assert(~fixtures.lazyheading.indexOf('#lazy heading'))
    $ = marky(fixtures.lazyheading, {prefixHeadingIds: false})
    assert.equal($('h1#lazy-heading-1').length, 1)
    assert.equal($('h2#lazy-heading-2').length, 1)
    assert.equal($('h3#lazy-heading-3').length, 1)
    assert.equal($('h4#lazy-heading-4').length, 1)
    assert.equal($('h5#lazy-heading-5').length, 1)
    assert.equal($('h6#lazy-heading-6').length, 1)
  })
})
