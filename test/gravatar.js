/* globals before, describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')

describe('gravatar', function () {
  var $

  before(function () {
    $ = marky(fixtures.gravatar)
  })

  it('replaces insecure gravatar img src URLs with secure HTTPS URLs', function () {
    assert(~fixtures.gravatar.indexOf('http://gravatar.com/avatar/123?s=50&d=retro'))
    assert.equal($('img').length, 3)
    assert.equal($('img').eq(0).attr('src'), 'https://secure.gravatar.com/avatar/123?s=50&d=retro')
  })

  it('leaves secure gravatar URLs untouched', function () {
    assert(~fixtures.gravatar.indexOf('https://secure.gravatar.com/avatar/456?s=50&d=retro'))
    assert.equal($('img').eq(1).attr('src'), 'https://secure.gravatar.com/avatar/456?s=50&d=retro')
  })

  it('leaves non-gravtar URLs untouched', function () {
    assert(~fixtures.gravatar.indexOf('http://not-gravatar.com/foo'))
    assert.equal($('img').eq(2).attr('src'), 'http://not-gravatar.com/foo')
  })
})
