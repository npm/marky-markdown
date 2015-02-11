var _ = require("lodash")
var highlighter = new (require("highlights"))()
var MD = require('markdown-it')

highlighter.loadGrammarsSync()

module.exports = function(html, options) {

  var mdOptions = {
    html: true,
    linkify: options.linkify,
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

  return MD(mdOptions).render(html)
}

// attempt to look up by the long language name, e.g. Ruby, JavaScript.
// fallback to assuming that lang is the extension of the code snippet.
function scopeNameFromLang(lang) {
  // alias language names.
  var mappings = {
    sh: 'shell',
    markdown: 'gfm'
  }

  lang = mappings[lang] || lang

  var grammar = _.pick(highlighter.registry.grammarsByScopeName, function(val, key) {
    return val.name.toLowerCase() === lang
  })

  if (Object.keys(grammar).length) {
    return Object.keys(grammar)[0]
  }

  return 'source.' + lang
}
