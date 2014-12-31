var cheerio     = require("cheerio")
var defaults    = require("lodash").defaults
var render      = require("./lib/render")
var sanitize    = require("./lib/sanitize")
var badges      = require("./lib/badges")
var frontmatter = require("./lib/frontmatter")
var github      = require("./lib/github")
var gravatar    = require("./lib/gravatar")
var headings    = require("./lib/headings")
var packagize   = require("./lib/packagize")

var marky = module.exports = function(markdown, options) {
  var html, $

  // Validate input
  if (!markdown || typeof markdown !== "string") {
    throw new Error("first argument must be a string")
  }

  if (options && typeof options !== "object") {
    throw new Error("options must but an object")
  }

  // Set default options
  options = options || {}
  defaults(options, {
    package: null,
    serveImagesWithCDN: false,
  })

  // Parse markdown into HTML and add syntax highlighting
  html = render(markdown)

  // Convert HTML fontmatter into meta tags
  html = frontmatter(html)

  // Sanitize malicious or malformed HTML
  html = sanitize(html)

  // Turn HTML into DOM object
  $ = cheerio.load(html)

  // Make gravatar img URLs secure
  $ = gravatar($)

  // Make relative GitHub link URLs absolute
  $ = github($, options.package)

  // Add CSS classes to paragraphs containing badges
  $ = badges($)

  // Add #hashy links to h1,h2,h3,h4,h5,h6
  $ = headings($)

  // Inject package name and description into README
  $ = packagize($, options.package)

  // Call .html() on the return value to get an HTML string
  return $
}
