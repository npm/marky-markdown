// Set rel=nofollow on all links if we have set `nofollow` in the options.

module.exports = function (md, options) {
  var defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

  md.renderer.rules.link_open = function handleLink (tokens, idx, options, env, self) {
    tokens[idx].attrPush(['rel', 'nofollow'])
    return defaultRender(tokens, idx, options, env, self)
  }
}
