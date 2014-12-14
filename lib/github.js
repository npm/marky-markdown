var gh = require("github-url-to-object")
var isURL = require("is-url")

module.exports = function($, package) {

  if (!package) return $
  if (!package.repository) return $
  if (!gh(package.repository.url)) return $

  var github_base = gh(package.repository.url).https_url

  $("a").each(function(i, el) {
    var href = URL.parse($(this).attr("href"))

    // Fully-qualified URLs are good
    if (href.host) return

    // No path means it's a #hash
    if (!href.path) return

    $(this).attr("href", github_base + "/blob/master/" + href.href)

  })

  return $
}
