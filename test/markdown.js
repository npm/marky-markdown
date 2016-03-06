/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')

describe('markdown processing and syntax highlighting', function () {
  var $
  before(function () {
    $ = marky(fixtures.basic, {highlightSyntax: true})
  })

  it('preserves query parameters in URLs when making them into links', function () {
    assert(~fixtures.basic.indexOf('watch?v=dQw4w9WgXcQ'))
    assert.equal($("a[href*='youtube.com']").attr('href'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  })

  it('converts github flavored fencing to code blocks', function () {
    assert(~fixtures.basic.indexOf('```js'))
    assert($('.highlight.js').length)
  })

  it('adds js class to javascript blocks', function () {
    assert(~fixtures.basic.indexOf('```js'))
    assert($('.highlight.js').length)
  })

  it('adds sh class to shell blocks', function () {
    assert(~fixtures.basic.indexOf('```sh'))
    assert($('.highlight.sh').length)
  })

  it('adds coffeescript class to coffee blocks', function () {
    assert(~fixtures.basic.indexOf('```coffee'))
    assert($('.highlight.coffeescript').length)
  })

  it('adds diff class to diff blocks', function () {
    assert(~fixtures.basic.indexOf('```diff'))
    assert($('.highlight.diff').length)
  })

  it('wraps code highlighter output in div.highlight', function () {
    // the idea here is that we have a 1:1 correspondence of <div class='highlight'>
    // and their contained <pre class='editor'> elements coming from the highlighter
    assert.equal($('div.highlight').length, $('div.highlight > pre.editor').length)
  })

  it('applies inline syntax highlighting classes to javascript', function () {
    assert($('.js.modifier').length)
    assert($('.js.function').length)
  })

  it('applies inline syntax highlighting classes to shell', function () {
    assert($('.shell.builtin').length)
  })

  it('applies inline syntax highlighting classes to coffeescript', function () {
    assert($('.coffee.begin').length)
  })

  it('applies inline syntax highlighting classes to diffs', function () {
    assert($('.diff.inserted').length)
    assert($('.diff.deleted').length)
  })

  it('does not encode entities within code blocks', function () {
    assert(~fixtures.enterprise.indexOf('"name": "@myco/anypackage"'))
    var $ = marky(fixtures.enterprise)
    assert(!~$.html().indexOf('<span>quot</span>'))
    assert(~$.html().indexOf('<span>&quot;</span>'))
  })

  it('converts leading tabs in code blocks to spaces', function () {
    var $ = marky(fixtures.basic)
    var indentHtml = $('.highlight.js .line .comment span:not(.js)').html()
    assert(!~indentHtml.indexOf('\t'))
    assert(~indentHtml.indexOf('&#xA0;'))
  })

  it('linkifies fully-qualified URLs', function () {
    assert(~fixtures['maintenance-modules'].indexOf('- https://gist.github.com/sindresorhus/8435329'))
    var $ = marky(fixtures['maintenance-modules'])
    assert($("a[href='https://gist.github.com/sindresorhus/8435329']").length)
  })

  it('does not convert text emoticons to unicode', function () {
    assert(~fixtures.github.indexOf(':)'))
    var $ = marky(fixtures.github)
    assert(~$.html().indexOf(':)'))
  })

  it('does not convert mustache template variables in markdown', function () {
    assert(~fixtures.basic.indexOf('{{template}}'))
    assert(~fixtures.basic.indexOf('{{do.not.replace}}'))
    var $ = marky(fixtures.basic)
    assert(~$.html().indexOf('{{template}}'))
    assert(~$.html().indexOf('{{do.not.replace}}'))
  })

  it('does not convert mustache template variables in fenced code blocks with highlighting on', function () {
    assert(~fixtures.basic.indexOf('{{name.lastName}}'))
    assert(~fixtures.basic.indexOf('{{name.firstName}}'))
    assert(~fixtures.basic.indexOf('{{name.suffix}}'))
    var $ = marky(fixtures.basic, {highlightSyntax: true})
    assert(~$.html().indexOf('{{name.lastName}}'))
    assert(~$.html().indexOf('{{name.firstName}}'))
    assert(~$.html().indexOf('{{name.suffix}}'))
  })

  it('does not convert mustache template variables in fenced code blocks with highlighting off', function () {
    assert(~fixtures.basic.indexOf('{{name.lastName}}'))
    assert(~fixtures.basic.indexOf('{{name.firstName}}'))
    assert(~fixtures.basic.indexOf('{{name.suffix}}'))
    var $ = marky(fixtures.basic, {highlightSyntax: false})
    assert(~$.html().indexOf('{{name.lastName}}'))
    assert(~$.html().indexOf('{{name.firstName}}'))
    assert(~$.html().indexOf('{{name.suffix}}'))
  })
})
