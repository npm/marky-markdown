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
