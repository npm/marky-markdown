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

var marky = module.exports = function(markdown, options, callback) {
  var html, $

  if (!callback) {
    callback = options
    options = {}
  }

  if (!markdown || typeof markdown !== "string") {
    return callback(Error("first argument must be a string"))
  }

  options = options || {}
  defaults(options, {
    sanitize: true,
    package: null,
    highlightSyntax: false,
    serveImagesWithCDN: false,
    debug: false
  })

  var log = function(msg) {
    if (options.debug) {
      console.log("marky-markdown: " + msg)
    }
  }

  log("\n\n" + markdown + "\n\n")

  log("Convert HTML frontmatter into meta tags")
  html = frontmatter(markdown)

  log("Remove HTML comments")
  html = comments(html)

  log("Parse markdown into HTML and add syntax highlighting")
  render(html, options, function(err, output) {
    html = output

    if (options.sanitize) {
      log("Sanitize malicious or malformed HTML")
      html = sanitize(html)
    }

    log("Parse HTML into a cheerio DOM object")
    $ = cheerio.load(html)

    log("Make gravatar image URLs secure")
    $ = gravatar($)

    log("Resolve relative GitHub link hrefs")
    $ = github($, options.package)

    log("Dress up Youtube iframes")
    $ = youtube($)

    log("Add CSS classes to paragraphs containing badges")
    $ = badges($)

    log("Add fragment hyperlinks links to h1,h2,h3,h4,h5,h6")
    $ = headings($)

    log("Inject package name and description into README")
    $ = packagize($, options.package)

    if (options.serveImagesWithCDN) {
      log("Rewrite relative image source to use CDN")
      $ = cdn($, options.package)
    }

    return callback(null, $)
  })

}
