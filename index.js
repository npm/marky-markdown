var cheerio     = require("cheerio")
var defaults    = require("lodash").defaults
var comments    = require("./lib/comments")
var render      = require("./lib/render")
var sanitize    = require("./lib/sanitize")
var badges      = require("./lib/badges")
var cdn         = require("./lib/cdn")
var frontmatter = require("./lib/frontmatter")
var github      = require("./lib/github")
var youtube     = require("./lib/youtube")
var gravatar    = require("./lib/gravatar")
var headings    = require("./lib/headings")
var packagize   = require("./lib/packagize")
var debug       = function(msg) {
  console.log("marky-markdown: " + msg)
}

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
    debug: false
  })

  // Convert HTML fontmatter into meta tags
  debug("frontmatter")
  html = frontmatter(markdown)

  // Remove HTML comments
  debug("comments")
  html = comments(html)

  // Parse markdown into HTML and add syntax highlighting
  debug("markdown/syntax highlighting")
  html = render(html)

  // Sanitize malicious or malformed HTML
  debug("sanitize")
  html = sanitize(html)

  // Turn HTML into DOM object
  debug("cheerio")
  $ = cheerio.load(html)

  // Make gravatar img URLs secure
  debug("gravatar")
  $ = gravatar($)

  // Make relative GitHub link URLs absolute
  debug("github")
  $ = github($, options.package)

  // Dress up Youtube iframes
  debug("youtube")
  $ = youtube($)

  // Add CSS classes to paragraphs containing badges
  debug("badges")
  $ = badges($)

  // Add #hashy links to h1,h2,h3,h4,h5,h6
  debug("headings")
  $ = headings($)

  // Inject package name and description into README
  debug("packagize")
  $ = packagize($, options.package)

  // Rewrite relative image source to use CDN
  if (options.serveImagesWithCDN) {
    debug("cdn")
    $ = cdn($, options.package)
  }

  // Call .html() on the return value to get an HTML string
  return $
}
