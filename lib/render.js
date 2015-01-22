var pygmentize = require("pygmentize-bundled")
var marked = require("marked")
var _ = require("lodash")

module.exports = function(html, options, callback) {

  if (!callback) {
    callback = options
    options = {}
  }

  options = _.clone(options)

  var markedOptions = {
    langPrefix: "highlight ",
  }

  if (options.highlightSyntax) {
    markedOptions.highlight = function (code, lang, callback) {
      pygmentize({lang: lang, format: "html"}, code, function (err, result) {
        callback(err, result.toString())
      })
    }
  }

  return marked(html, markedOptions, callback)
}
