// This plugin marks badges in rendered docuemnts. The markdown processor wraps
// paragraph tags around standalone elements like badge images. For example:
//
//     [![maude](http://cats.com/maude.jpg)](http://cats.com)
//
// renders as
//
//     <p>
//       <a href="http://cats.com">
//         <img src="http://cats.com/maude.jpg" alt="maude">
//       </a>
//     </p>
//
// so what we do is check to see if cats.com is in the list of domains that
// serve badge images, and if it is, mark the image with `class='badge'`. If the
// surrounding paragraph contains no text, the paragraph gets marked with
// `class='badge-only'`.
//
var URL = require('url')
var tokenUtil = require('../token-util')
var domains = [
  'badge.fury.io',
  'badges.github.io',
  'badges.gitter.im',
  'ci.testling.com',
  'coveralls.io',
  'david-dm.org',
  'img.shields.io',
  'nodei.co',
  'saucelabs.com',
  'secure.travis-ci.org',
  'travis-ci.org'
]

module.exports = function (md, opts) {
  //
  // Add class='badge' to badge images
  //
  var originalRule = md.renderer.rules.image
  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    var src = tokens[idx].attrGet('src')

    if (src && src.length) {
      var url = URL.parse(src)

      if (url.host && domains.indexOf(url.host) > -1) {
        tokens[idx].attrJoin('class', 'badge')
      }
    }
    return originalRule.call(this, tokens, idx, options, env, self)
  }

  //
  // Add class='badge-only' to paragraphs containing badges and no text
  //
  var originalParagraphRule = md.renderer.rules.paragraph_open
  md.renderer.rules.paragraph_open = function (tokens, idx, options, env, self) {
    var paragraph = tokens[idx]
    var contents = tokens[idx + 1]
    var hasContents = !!contents.children

    if (!paragraph.hidden && hasContents && !contents.children.some(tokenUtil.isText)) {
      tokens[idx].attrJoin('class', 'badge-only')
    }

    if (originalParagraphRule) {
      return originalParagraphRule.call(this, tokens, idx, options, env, self)
    } else {
      return md.renderer.renderToken(tokens, idx, options)
    }
  }
}
