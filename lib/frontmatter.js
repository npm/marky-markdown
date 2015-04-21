var cheerio = require('cheerio')
var fm = require('html-frontmatter')
var fmt = require('util').format

module.exports = function (html) {
  var $ = cheerio.load(html)
  var meta = fm(html)
  if (!meta) return html

  Object.keys(meta).reverse().forEach(function (key) {
    $.root().prepend(fmt('<meta name="%s" content="%s">', key, meta[key]))
  })

  return $.html()
}
