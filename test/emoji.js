/* globals describe, it */

var assert = require('assert')
var marky = require('..')
var fixtures = require('./fixtures')

describe('emoji', function () {
  it('replaces markdown syntax for emoji with unicode for the emoji', function () {
    assert(~fixtures.github.indexOf(':sparkles:'))
    var $ = marky(fixtures.github)
    assert($.html().indexOf('✨'))
  })

  describe('in headings', function () {
    it('parsed the emoji-in-headings test', function () {
      assert(~fixtures.emojiheadings.indexOf('# Hello world!'))
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h1#hello-world').length, 1)
    })

    it('single gemoji (no underscore)', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#ok-no-underscore').length, 1)
    })

    it('single gemoji (with underscore)', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#ok_hand-single').length, 1)
    })

    it('two sequential gemojis', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#ok_handhatched_chick-two-in-a-row-with-no-spaces').length, 1)
    })

    it('two space-delimited gemojis', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#ok_hand-hatched_chick-two-in-a-row').length, 1)
    })

    it('single unicode emoji', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#-unicode-emoji').length, 1)
    })

    it('two hyphen-separated unicode emoji', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#--unicode-hyphen-unicode').length, 1)
    })

    it('two underscore-separated unicode emoji', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#_-unicode-underscore-unicode').length, 1)
    })

    it('single unicode emoji plus spaces and a hyphen', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#---an-emoji').length, 1)
    })

    it('single gemoji plus spaces and a hyphen', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#smile---a-gemoji').length, 1)
    })

    it('single emoji plus markdown', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#---an-emoji-and-other-markdown').length, 1)
    })

    it('single gemoji plus markdown', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#---an-emoji-and-other-markdown').length, 1)
    })

    it('single emoji plus HTML', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#---an-emoji-and-html').length, 1)
    })

    it('single gemoji plus HTML', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#smile---a-gemoji-and-html').length, 1)
    })

    it('invalid gemoji', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#invalid_emoji_name-an-invalid-emoji-name').length, 1)
    })

    it('emoji plus colon', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#emoji-with-a-colon-').length, 1)
    })

    it('gemoji plus colon', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#gemoji-with-a-colon-ok_hand').length, 1)
    })

    it('both unicode emoji and gemoji', function () {
      var $ = marky(fixtures.emojiheadings, {prefixHeadingIds: false})
      assert.equal($('h2#both--emoji-and-ok_hand-gemoji').length, 1)
    })
  })
})
