var highlighter = new (require("highlights"))()
var _ = require("lodash")

module.exports = function(html, options, callback) {

  if (!callback) {
    callback = options
    options = {}
  }

  options = _.clone(options)

  var mdOptions = {
    html: true,
    langPrefix: "highlight ",
  }

  if (options.highlightSyntax) {
    mdOptions.highlight = function (code, lang) {
      return highlighter.highlightSync({
        fileContents: code,
        scopeName: lang
      })
    }
  }

  html = require('markdown-it')(mdOptions).render(html)

  return callback(null, html)
}
