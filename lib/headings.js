var fmt = require("util").format
var slug = require("slug")

var headings = module.exports = function($, options) {

  if (options && !options.prefixHeadingIds) {
    headings.prefix = ""
  }

  $("h1,h2,h3,h4,h5,h6").each(function(i, elem) {
    if ($(this).find("a").length) return

    if (!$(this).attr("id")) {
      $(this).attr("id", headings.prefix + slug($(this).text()).toLowerCase())
    }

    $(this).addClass("deep-link")

    $(this).html(fmt(
      "<a href=\"#%s\">%s</a>",
      $(this).attr("id").replace(headings.prefix, ""),
      $(this).text()
    ))
  })

  return $
}

headings.prefix = 'user-content-'
