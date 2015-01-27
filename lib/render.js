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
        scopeName: scopeNameFromLang(lang)
      })
    }
  }

  html = require('markdown-it')(mdOptions).render(html)

  return callback(null, html)
}

// attempt to lookup by the long language name, e.g.,
// Ruby, JavaScript, fallback to assuming that lang
// is the extension of the code snippet.
function scopeNameFromLang(lang) {
  var mappings = {
    sh: 'shell'
  }

  lang = mappings[lang] || lang; // mappings for highlights' benefit.

  var grammar = _.pick(highlighter.registry.grammarsByScopeName, function(val, key) {
    return val.name.toLowerCase() === lang
  })

  if (Object.keys(grammar).length) return Object.keys(grammar)[0]
  else return 'source.' + lang
}
