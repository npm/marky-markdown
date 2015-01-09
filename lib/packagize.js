var fmt = require("util").format
var similarity = require("similarity")
var marked = require("marked")
var cheerio = require("cheerio")

// Inject package.json `name` and `description` into top of file,
// and add classes to existing elements that look like dupes.

module.exports = function($, package) {

  if (!package) return $

  // mark first h1 if it closely matches package name
  var h1 = $('h1').first()
  if (
    similarity(package.name, h1.text()) > 0.6 ||
    ~h1.text().toLowerCase().indexOf(package.name.toLowerCase())
  ) {
    h1.addClass("package-name-redundant")
  }

  if (package.description) {

    var h1 = $('h1').first()
    if (
      similarity(package.description, h1.text()) > 0.6 ||
      ~h1.text().toLowerCase().indexOf(package.description.toLowerCase())
    ) {
      h1.addClass("package-description-redundant")
    }

    var p = $('p')
      .slice(0,5)
      .filter(function(i, el) {
        return $(this).text().length
      })
      .first()

    if (similarity(package.description, p.text()) > 0.6) {
      p.addClass("package-description-redundant")
    }

    // Process package.description as a markdown string,
    // then add it to the top of the readme
    var $description = cheerio.load(marked(package.description))
    $description("p").addClass("package-description")
    $.root().prepend($description.html())

  }

  $.root().prepend(fmt("<h1 class=\"package-name\"><a href=\"#readme\">%s</a></h1>", package.name))

  return $
}
