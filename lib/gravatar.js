var URL = require("url")

// Ensure all gravatar img src URLs are secure

module.exports = function($) {

  $("img[src*='gravatar.com']").each(function(i, el) {
    var url = URL.parse($(this).attr("src"))
    if (url.host.match(/^(\w+\.)?gravatar\.com$/)) {
      url.protocol = "https"
      url.host = "secure.gravatar.com"
      $(this).attr("src", URL.format(url))
    }
  })

  return $
}
