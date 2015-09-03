var _ = require('lodash')
var Highlights = require('highlights')
var MD = require('markdown-it')
var gctrap = require('./trap')

var highlighter = new Highlights()

var languages = [
  'atom-language-nginx',
  'language-dart',
  'language-rust',
  'language-erlang',
  'language-glsl',
  'language-haxe',
  'language-ini',
  'language-stylus'
]

languages.forEach(function (language) {
  highlighter.requireGrammarsSync({
    modulePath: require.resolve(language + '/package.json')
  })
})

gctrap(highlighter.registry.grammars,2000)

module.exports = function (html, options) {
  var mdOptions = {
    html: true,
    langPrefix: 'highlight '
  }
  
  if (options.highlightSyntax) {

    mdOptions.highlight = function (code, lang) {
      highlighter.highlightSync({
        fileContents: code,
        scopeName: scopeNameFromLang(highlighter,lang)
      })
      return code
    }
  }
  
  return MD(mdOptions).render(html)
}

var mappings = {
  sh: 'source.shell',
  markdown: 'source.gfm',
  erb: 'text.html.erb'
}

// attempt to look up by the long language name, e.g. Ruby, JavaScript.
// fallback to assuming that lang is the extension of the code snippet.
function scopeNameFromLang (highlighter,lang) {
  // alias language names.

  if (mappings[lang]) return mappings[lang]

  var grammar = _.pick(highlighter.registry.grammarsByScopeName, function (val, key) {
    return val.name.toLowerCase() === lang
  })

  if (Object.keys(grammar).length) {
    return Object.keys(grammar)[0]
  }

  var name = 'source.' + lang
  mappings[lang] = name

  return name
}

