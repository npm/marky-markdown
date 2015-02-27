var fmt = require("util").format
var similarity = require("similarity")
var sanitize = require("./sanitize")
var markdown = require("markdown-it")({html: true})
var cheerio = require("cheerio")

// Add classes to existing elements that look like dupes
// of package.name and package.description

var packagize = module.exports = function($, package) {

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

    // Find the first paragraph with text content
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

  return $
}


packagize.parsePackageDescription = function(description) {
  return sanitize(markdown.renderInline(description))
}
