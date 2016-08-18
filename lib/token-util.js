var assign = require('lodash.assign')

var Token // Token constructor from markdown-it

var tokenUtil = module.exports = {}

tokenUtil.set = function (TokenConstructor) {
  Token = TokenConstructor
}

// Look for tokens with type === 'emoji', which are :shortcode: style emoji
// characters that have been replaced by the markdown-it-emoji plugin. Return the
// original tokens, unless they were converted gemoji strings; then return a copy so
// we haven't clobbered the original when it comes time to render HTML
tokenUtil.unemoji = function (token) {
  if (token.type === 'emoji') {
    return assign(new Token(), token, {content: token.markup})
  }
  return token
}

// wrap the the array of tokens in a link with the given slug as its destination
// the intent is to operate on the .children array of a token
tokenUtil.wrap = function (tokens, slug) {
  var linkOpen = new Token('link_open', 'a', 1)
  var linkClose = new Token('link_close', 'a', -1)

  linkOpen.attrs = [['href', '#' + slug]]

  tokens.unshift(linkOpen)
  tokens.push(linkClose)
}
