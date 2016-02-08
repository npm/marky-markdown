var similarity = require('similarity')
var sanitize = require('./sanitize')
var markdown = require('markdown-it')({html: true})

// Add classes to existing elements that look like dupes
// of pkg.name and pkg.description

var packagize = module.exports = function ($, pkg) {
  if (!pkg) return $
  if (!pkg.name) return $

  // mark first h1 if it closely matches pkg name
  var h1 = $('h1').first()
  if (
    similarity(pkg.name, h1.text()) > 0.6 ||
    similarity(pkg.name.replace(/^@[^\/]+\//, ''), h1.text()) > 0.6 || // filter out scope name
    ~h1.text().toLowerCase().indexOf(pkg.name.toLowerCase())
  ) {
    h1.addClass('package-name-redundant')
  }

  if (pkg.description) {
    pkg.description += '' // invalid description in some cases can cause a crash

    if (
      similarity(pkg.description, h1.text()) > 0.6 ||
      ~h1.text().toLowerCase().indexOf(pkg.description.toLowerCase())
    ) {
      h1.addClass('package-description-redundant')
    }

    // Find the first paragraph with text content
    var p = $('p')
      .slice(0, 5)
      .filter(function (i, el) {
        return $(this).text().length
      })
      .first()

    if (similarity(pkg.description, p.text()) > 0.6) {
      p.addClass('package-description-redundant')
    }
  }

  return $
}

packagize.parsePackageDescription = function (description) {
  return sanitize(markdown.renderInline(description))
}
