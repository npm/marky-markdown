var URL = require("url")
var path = require("path")
var cdnHost = "https://cdn.npm.im"

module.exports = function($, package) {

  if (!package) return $
  if (!package.name) return $
  if (!package.version) return $

  $("img").each(function(i, el) {

    var url = URL.parse($(this).attr("src"))

    // Skip fully-qualified URLs
    if (url.host) return

    // Skip protocol-relative URLs
    if (url.path.match(/^\/\//)) return

    $(this).attr("src", cdnHost + "/" + package.name + "@" + package.version + path.join("/", url.href))

  })

  return $
}
