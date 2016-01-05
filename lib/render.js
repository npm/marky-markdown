var _ = require('lodash')
var Highlights = require('highlights')
var MD = require('markdown-it')
var lazyHeaders = require('markdown-it-lazy-headers')
var cleanup = require('./cleanup')
var emoji = require('markdown-it-emoji')

var highlighter = new Highlights()

var languages = [
  'atom-language-nginx',
  'atom-language-diff',
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

// cleanup generated rules in the highlighter registry if they are idle for 2000ms
// they take a tremendous amount of memory if you process many languages in a server type environment.
cleanup(highlighter.registry.grammars)

module.exports = function (html, options) {
  var mdOptions = {
    html: true,
    langPrefix: 'highlight ',
    linkify: options.linkify
  }

  if (options.highlightSyntax) {
    mdOptions.highlight = function (code, lang) {
      return highlighter.highlightSync({
        fileContents: code,
        scopeName: scopeNameFromLang(highlighter, lang)
      })
    }
  }

  var parser = MD(mdOptions).use(lazyHeaders).use(emoji)
  return parser.render(html)
}

var mappings = {
  sh: 'source.shell',
  markdown: 'source.gfm',
  erb: 'text.html.erb'
}

// attempt to look up by the long language name, e.g. Ruby, JavaScript.
// fallback to assuming that lang is the extension of the code snippet.
function scopeNameFromLang (highlighter, lang) {
  // alias language names.

  if (mappings[lang]) return mappings[lang]

  var grammar = _.pick(highlighter.registry.grammarsByScopeName, function (val, key) {
    return val.name.toLowerCase() === lang
  })

  if (Object.keys(grammar).length) {
    return Object.keys(grammar)[0]
  }

  var name = 'source.' + lang
  // mappings[lang] = name

  return name
}
