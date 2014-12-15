var fmt = require("util").format

module.exports = function($) {

  $("h1,h2,h3,h4,h5,h6").each(function(i, elem) {
    if ($(this).find("a").length) return
    if ($(this).attr("id")) {
      $(this).addClass("deep-link")
      $(this).html(fmt(
        "<a href=\"#%s\">%s</a>",
        $(this).attr("id"),
        $(this).text()
      ))
    }
  })

  return $
}
