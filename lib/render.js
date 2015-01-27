var _ = require("lodash")
var escapeHtml = require('escape-html')
var highlighter = new (require("highlights"))()
var MD = require('markdown-it')
var S = require('string')

// pre-load grammars, these are used
// when performing language lookups.
highlighter.loadGrammarsSync()

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

  // render markdown, we perform automatic
  // linkifiication of headers.
  var md = MD(mdOptions)
  md.renderer.rules.heading_open = headingOpen
  html = md.render(html)

  return callback(null, html)
}

// attempt to lookup by the long language name, e.g.,
// Ruby, JavaScript, fallback to assuming that lang
// is the extension of the code snippet.
function scopeNameFromLang(lang) {
  // alias language names.
  var mappings = {
    sh: 'shell',
    markdown: 'gfm'
  }

  lang = mappings[lang] || lang // mappings for highlights' benefit.

  var grammar = _.pick(highlighter.registry.grammarsByScopeName, function(val, key) {
    return val.name.toLowerCase() === lang
  })

  if (Object.keys(grammar).length) return Object.keys(grammar)[0]
  else return 'source.' + lang
}

// adds anchor ids to headings:
// original function:
// https://github.com/markdown-it/markdown-it/blob/master/lib/renderer.js
function headingOpen(tokens, idx, options, env, self) {
  return '<h' + tokens[idx].hLevel + generateIdString(tokens[idx + 1]) + '>'
}

// given the text of an H-tag, generates an id.
function generateIdString(token) {
  if (!token || !token.content) return ''

  var id = token.content.toLowerCase()
  var idPrefix = require("./headings").prefix

  id = S(id).stripTags().s // remove tags, e.g., <a>
  id = S(id).stripPunctuation().s // remove punctionation Ben's.
  id = id.replace(/ /g, '-') // replace remaining spaces with dashes.

  return ' id="' + idPrefix + escapeHtml(id) + '"'
}
