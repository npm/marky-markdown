var similarity = require("similarity")

// Remove readme content that is already covered by
// package.name and package.description

module.exports = function($, package) {

  if (!package) return $

  // mark first h1 if it closely matches package name
  if (package.name) {
    var h1 = $('h1:not(.superfluous)').first()
    if (
      similarity(package.name, h1.text()) > 0.6 ||
      ~h1.text().toLowerCase().indexOf(package.name.toLowerCase())
    ) {
      h1.addClass("superfluous")
    }
  }

  // mark first paragraph if it closely matches package description
  if (package.description) {
    var p = $('p:not(.superfluous)').first()
    if (similarity(package.description, p.text()) > 0.6) {
      p.addClass("superfluous")
    }
  }

  return $

}
