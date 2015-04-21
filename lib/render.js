var _ = require('lodash')
var highlighter = new (require('highlights'))()
var MD = require('markdown-it')
var languages = [
  'atom-language-nginx',
  'language-dart',
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

module.exports = function (html, options) {
  var mdOptions = {
    html: true,
    langPrefix: 'highlight '
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
function scopeNameFromLang (lang) {
  // alias language names.
  var mappings = {
    sh: 'source.shell',
    markdown: 'source.gfm',
    erb: 'text.html.erb'
  }

  if (mappings[lang]) return mappings[lang]

  var grammar = _.pick(highlighter.registry.grammarsByScopeName, function (val, key) {
    return val.name.toLowerCase() === lang
  })

  if (Object.keys(grammar).length) {
    return Object.keys(grammar)[0]
  }

  return 'source.' + lang
}
