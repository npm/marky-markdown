var gh = require("github-url-to-object")
var URL = require("url")
var path = require("path")

module.exports = function($, package) {

  if (!package) return $
  if (!package.repository) return $
  if (!gh(package.repository.url)) return $

  var github_base = gh(package.repository.url).https_url

  $("a").each(function(i, el) {

    var url = URL.parse($(this).attr("href"))

    // Skip fully-qualified URLs
    if (url.host) return

    // Skip #hash fragments
    if (!url.path) return

    // Skip protocol-relative URLs
    if (url.path.match(/^\/\//)) return

    $(this).attr("href", github_base + path.join("/blob/master/", url.href))

  })

  return $
}
