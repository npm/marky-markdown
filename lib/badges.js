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

var domains = [
  "badge.fury.io",
  "badges.github.io",
  "badges.gitter.im",
  "ci.testling.com",
  "coveralls.io",
  "david-dm.org",
  "img.shields.io",
  "nodei.co",
  "saucelabs.com",
  "secure.travis-ci.org",
  "travis-ci.org",
]

module.exports = function($) {

  domains.forEach(function(domain){
    $("p:has(img[src*='"+domain+"'])").each(function(i,el) {
      $(this).addClass("badge")

      // Add an extra class for identifying p tags that contain
      // content other than a standalone badge
      if ($(this).text().length) {
        $(this).addClass("badge-with-siblings")
      }

    })
  })

  return $
}
