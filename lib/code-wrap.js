var plugin = module.exports = function (md, options) {
  // monkey patch the 'fence' parsing rule to restore markdown-it's pre-5.1 behavior
  // (see https://github.com/markdown-it/markdown-it/issues/190)
  var stockFenceRule = md.renderer.rules.fence
  md.renderer.rules.fence = function (tokens, idx, options, env, slf) {
    // call the original rule first rather than inside the 'return' statement
    // because we need the 'class' attribute processing it does
    var output = stockFenceRule(tokens, idx, options, env, slf).trim()
    return '<' + plugin.tag + slf.renderAttrs(tokens[idx]) + '>' + output + '</' + plugin.tag + '>\n'
  }
}

plugin.tag = 'div'
