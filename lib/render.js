var _ = require('lodash')
var hl = require('./highlights')

var MD = require('markdown-it')
var once = require('once')
var uuid = require('uuid')

var highlighter = hl(noop)

module.exports = function (html, options, cb) {
  var mdOptions = {
    html: true,
    langPrefix: 'highlight '
  }

  var pending = 0
  var result = ''
  var async = false

  if (typeof cb === 'function') {
    async = true
    cb = once(cb)
  }

  // support external highlighter.
  var _hl = options.highlighter || highlighter
  var highlightUsed = 0

  if (options.highlightSyntax) {
    mdOptions.highlight = function (code, lang) {
      highlightUsed++

      if (async) {
        pending++
        var id = uuid.v4()

        hl.onReady(_hl, function (err) {
          if (err) return cb(err)
          // support highlighter passed in from options.
          _hl.highlight({
            fileContents: code,
            scopeName: scopeNameFromLang(highlighter, lang)
          }, function (err, highlighted) {
            if (err) return cb(err)

            result = result.split(id).join(highlighted || code)

            if (!--pending) {
              cb(false, result)
            }
          })
        })
        return id
      }

      if (!hl.isReady(_hl)) {
        var same = highlighter === _hl
        _hl = hl.sync()
        if (same) highlighter = _hl
      }

      return highlighter.highlightSync({
        fileContents: code,
        scopeName: scopeNameFromLang(_hl, lang)
      })
    }
  }

  result = MD(mdOptions).render(html)

  if (!async) return result
  else if (!highlightUsed) {
    setImmediate(function () {
      cb(false, result)
    })
  }

}

module.exports.resetHighlighter = function (cb) {
  hl(function (err, _hl) {
    if (_hl) highlighter = _hl
    cb(err)
  })
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

  return name
}

function noop () {}
