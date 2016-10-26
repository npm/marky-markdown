// Parse link destination
//
// copied from markdown-it/lib/helpers/parse_link_destination
'use strict'

var isSpace = require('../common/utils').isSpace
var unescapeAll = require('../common/utils').unescapeAll

module.exports = function parseLinkDestination (str, pos, max) {
  var code
  var level
  var lines = 0
  var start = pos
  var result = {
    ok: false,
    pos: 0,
    lines: 0,
    str: ''
  }

  if (str.charCodeAt(pos) === 0x3C /* < */) {
    pos++
    while (pos < max) {
      code = str.charCodeAt(pos)
      if (code === 0x0A /* \n */ || isSpace(code)) { return result }
      if (code === 0x3E /* > */) {
        result.pos = pos + 1
        result.str = unescapeAll(str.slice(start + 1, pos))
        result.ok = true
        return result
      }
      if (code === 0x5C /* \ */ && pos + 1 < max) {
        pos += 2
        continue
      }

      pos++
    }

    // no closing '>'
    return result
  }

  // this should be ... } else { ... branch

  level = 0
  while (pos < max) {
    code = str.charCodeAt(pos)

    if (code === 0x20) { // space
      pos++
      while (pos < max && code !== 0x22 && code !== 0x27) { // 0x22 = double quote, 0x27 = single quote
        code = str.charCodeAt(pos++)
      }
      if (pos === max) {
        pos--
        break
      }
      if (code === 0x22 || code === 0x27) {
        pos = pos - 2
        break
      }
    }

    // ascii control characters
    if (code < 0x20 || code === 0x7F) { break }

    if (code === 0x5C /* \ */ && pos + 1 < max) {
      pos += 2
      continue
    }

    if (code === 0x28 /* ( */) {
      level++
      if (level > 1) { break }
    }

    if (code === 0x29 /* ) */) {
      level--
      if (level < 0) { break }
    }

    pos++
  }

  if (start === pos) { return result }

  result.str = unescapeAll(str.slice(start, pos))
  result.lines = lines
  result.pos = pos
  result.ok = true
  return result
}
