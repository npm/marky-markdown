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

// Add `badge` class to <p> tags containing badge images
module.exports = function($) {
  domains.forEach(function(domain){
    $("p:has(img[src*='//"+domain+"'])").addClass("badge")
  })
  return $
}
