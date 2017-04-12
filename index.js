var defaults = require('lodash.defaults')
var render = require('./lib/render')
var sanitize = require('./lib/sanitize')

var marky = module.exports = function (markdown, options) {
  var html

  if (typeof markdown !== 'string') {
    throw Error('first argument must be a string')
  }

  options = options || {}
  defaults(options, {
    sanitize: true,
    linkify: true,
    highlightSyntax: true,
    prefixHeadingIds: true,
    enableHeadingLinkIcons: true,
    serveImagesWithCDN: false,
    debug: false,
    package: null
  })

  var log = function (msg) {
    if (options.debug) {
      console.log('marky-markdown: ' + msg)
    }
  }

  log('\n\n' + markdown + '\n\n')

  log('Parse markdown into HTML and add syntax highlighting')
  html = render(markdown, options)

  if (options.sanitize) {
    log('Sanitize malicious or malformed HTML')
    html = sanitize(html, options)
  }

  return html
}

marky.parsePackageDescription = function (description) {
  return sanitize(render.renderPackageDescription(description))
}
