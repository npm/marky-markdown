/*

The markdown processor wraps paragraph tags around standalone
elements like badge images. This markdown:

[![maude](http://cats.com/maude.jpg)](http://cats.com)

becomes

<p>
  <a href="http://cats.com">
    <img src="http://cats.com/maude.jpg" alt="maude">
  </a>
</p>

... so tag the surrounding paragraphs instead of the badge
images themselves

*/

var URL = require('url')
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

module.exports = function ($) {
  domains.forEach(function (domain) {
    $("img[src*='" + domain + "']").each(function (i, el) {
      var url = URL.parse($(this).attr('src'))
      if (url.host !== domain) return

      $(this).addClass('badge')

      // If wrapped by a silly p tag that contains no other
      // content, slap a badge-only class on that p tag
      var wrapper = $(this).closest('p')
      if ($(wrapper).length && $(wrapper).text() === '') {
        $(wrapper).addClass('badge-only')
      }
    })
  })
  return $
}
