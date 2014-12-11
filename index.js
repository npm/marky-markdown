// npm i mocha -d && npm i marked sanitizer highlight.js github-url-to-object cheerio similarity lodash

var marked      = require("marked")
var cheerio     = require("cheerio")
var merge       = require("lodash").merge

var badge       = require("../lib/badge")
var packagize   = require("../lib/packagize")
var renderer    = require("../lib/renderer")
var stanitize   = require("../lib/sanitize")

var marky = module.exports = function(markdown, options) {
  var html
  var $

  if (!markdown || typeof markdown !== "string") {
    throw new Error("first argument must be a string")
  }

  if (options && typeof options !== "object") {
    throw new Error("options must but an object")
  }

  if (!options) {
    options = {}
  }

  merge(options, {
    package: null,
    renderer: renderer,
  })

  html = marked.parse(markdown, {renderer: options.renderer})
  html = sanitize(html, options.package)
  $ = cheerio.load(html)
  $ = badge($)
  $ = packagize($, options.package)
  return $
}
