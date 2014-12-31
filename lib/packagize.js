var fmt = require("util").format
var similarity = require("similarity")

// Inject package.json `name` and `description` into top of file,
// and add classes to existing elements that look like dupes.

module.exports = function($, package) {

  if (!package) return $

  // mark first h1 if it closely matches package name
  if (package.name) {
    var h1 = $('h1').first()
    if (
      similarity(package.name, h1.text()) > 0.6 ||
      ~h1.text().toLowerCase().indexOf(package.name.toLowerCase())
    ) {
      h1.addClass("package-name-redundant")
    }
  }

  // mark first paragraph that contains text if it closely matches package description
  if (package.description) {

    var p = $('p')
      .slice(0,5)
      .filter(function(i, el) {
        return $(this).text().length
      })
      .first()

    if (similarity(package.description, p.text()) > 0.6) {
      p.addClass("package-description-redundant")
    }
  }

  // Inject package.json values at the top of the readme
  $.root().prepend(fmt("<p class=\"package-description\">%s</p>", package.description))
  $.root().prepend(fmt("<h1 class=\"package-name\"><a href=\"#readme\">%s</a></h1>", package.name))

  return $
}
