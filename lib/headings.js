var fmt = require("util").format
var slug = require("slug")

var headings = module.exports = function($, options) {

  if (options && !options.prefixHeadingIds) {
    headings.prefix = ""
  }

  $("h1,h2,h3,h4,h5,h6").each(function(i, elem) {

    // Bail if heading already contains a hyperlink
    if ($(this).find("a").length) return

    // Generate an ID based on the heading's innerHTML
    if (!$(this).attr("id")) {
      var postfix = slug(
        $(this).text()
          .replace(/[<>]/g, "") // In case the heading contains `<stuff>`
          .toLowerCase()        // because `slug` doesn't lowercase
        )
      $(this).attr("id", headings.prefix + postfix)
    }

    $(this).addClass("deep-link")

    $(this).html(fmt(
      "<a href=\"#%s\">%s</a>",
      $(this).attr("id").replace(headings.prefix, ""),
      $(this).html()
    ))
  })

  return $
}

headings.prefix = 'user-content-'
