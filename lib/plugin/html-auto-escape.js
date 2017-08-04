// This plugin automatically escapes certain HTML tags in html_block tokens
// because that's what GitHub does. For example, given the markdown input
//
//     <div>Put your rules in a `<style>` element: ...</div>
//
// CommonMark assumes any HTML blocks are meant to render exactly as is, which
// in this particular case means we end up with malformed HTML having an opening
// <style> element with no closing tag and invalid content. However, GitHub
// assumes you actually wanted the rule to appear as escaped markup, so it will
// automatically translate the angle brackets to `&lt;` and `&gt;`:
//
//     <div>Put your rules in a `&lt;style&gt;` element: ...</div>
//
// See https://github.com/npm/marky-markdown/issues/363 for the discussion.
//

function renderContent (tokens, idx) {
  return tokens[idx].content
}

module.exports = function (md, opts) {
  // if opts.sanitize is falsy, we skip this transformation since we're trusting
  // the input to be correct, and this rule is allowing
  if (opts && typeof opts.sanitize !== 'undefined' && !opts.sanitize) return

  var originalRule = md.renderer.rules.html_block || renderContent
  md.renderer.rules.html_block = function (tokens, idx, options, env, self) {
    var html = tokens[idx].content
    var regex = /<(\/?)(iframe|script|style|textarea|title)([^>]*)>/gi

    tokens[idx].content = html.replace(regex, '&lt;$1$2$3&gt;')

    return originalRule.call(this, tokens, idx, options, env, self)
  }
}
