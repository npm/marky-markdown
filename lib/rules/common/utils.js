// Copied from markdown-it/lib/common/utils

var entities = require('./entities')

var utils = module.exports

function isSpace (code) {
  switch (code) {
    case 0x09:
    case 0x20:
      return true
  }
  return false
}

var UNESCAPE_MD_RE = /\\([!"#$%&'()*+,\-.\/:;<=>?@[\\\]^_`{|}~])/g
var ENTITY_RE = /&([a-z#][a-z0-9]{1,31});/gi
var UNESCAPE_ALL_RE = new RegExp(UNESCAPE_MD_RE.source + '|' + ENTITY_RE.source, 'gi')

var DIGITAL_ENTITY_TEST_RE = /^#((?:x[a-f0-9]{1,8}|[0-9]{1,8}))/i

function isValidEntityCode (c) {
  // broken sequence
  if (c >= 0xD800 && c <= 0xDFFF) { return false }
  // never used
  if (c >= 0xFDD0 && c <= 0xFDEF) { return false }
  if ((c & 0xFFFF) === 0xFFFF || (c & 0xFFFF) === 0xFFFE) { return false }
  // control codes
  if (c >= 0x00 && c <= 0x08) { return false }
  if (c === 0x0B) { return false }
  if (c >= 0x0E && c <= 0x1F) { return false }
  if (c >= 0x7F && c <= 0x9F) { return false }
  // out of range
  if (c > 0x10FFFF) { return false }
  return true
}

function fromCodePoint (c) {
  if (c > 0xffff) {
    c -= 0x10000
    var surrogate1 = 0xd800 + (c >> 10)
    var surrogate2 = 0xdc00 + (c & 0x3ff)

    return String.fromCharCode(surrogate1, surrogate2)
  }
  return String.fromCharCode(c)
}

var _hasOwnProperty = Object.prototype.hasOwnProperty

function has (object, key) {
  return _hasOwnProperty.call(object, key)
}

function replaceEntityPattern (match, name) {
  var code = 0

  if (has(entities, name)) {
    return entities[name]
  }

  if (name.charCodeAt(0) === 0x23 /* # */ && DIGITAL_ENTITY_TEST_RE.test(name)) {
    if (name[1].toLowerCase() === 'x') {
      code = parseInt(name.slice(2), 16)
    } else {
      code = parseInt(name.slice(1), 10)
    }
    if (isValidEntityCode(code)) {
      return fromCodePoint(code)
    }
  }

  return match
}

function unescapeAll (str) {
  if (str.indexOf('\\') < 0 && str.indexOf('&') < 0) { return str }

  return str.replace(UNESCAPE_ALL_RE, function (match, escaped, entity) {
    if (escaped) { return escaped }
    return replaceEntityPattern(match, entity)
  })
}

// Hepler to unify [reference labels].
//
function normalizeReference (str) {
  // use .toUpperCase() instead of .toLowerCase()
  // here to avoid a conflict with Object.prototype
  // members (most notably, `__proto__`)
  return str.trim().replace(/\s+/g, ' ').toUpperCase()
}

utils.unescapeAll = unescapeAll
utils.isSpace = isSpace
utils.normalizeReference = normalizeReference
