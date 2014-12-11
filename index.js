// npm i mocha -d && npm i marked sanitizer highlight.js github-url-to-object cheerio similarity

var marked          = require("marked")
var cheerio         = require("cheerio")
var similarity      = require("similarity")
var fmt             = require("util").format
var badges          = require("../lib/badges")
var urlPolicy       = require("../lib/url-policy")
var renderer        = require("../lib/renderer")
var sanitizer       = require("sanitizer")

var marky = module.exports = function(markdown, options) {

  if (!markdown || typeof markdown !== "string") {
    throw new Error("first argument must be a string")
  }

  var html = marked.parse(markdown, {renderer: renderer})

  var $ = cheerio.load(html)

  return
}
