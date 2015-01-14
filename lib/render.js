var hljs = require("highlight.js")
var MarkdownIt = require("markdown-it")

var md = new MarkdownIt({
  html: true,
  langPrefix: "hljs ",
  highlight: function(code) {
    return hljs.highlightAuto(code).value;
  }
})

module.exports = function render(markdown) {
  // return require('marked')(markdown)
  return md.render(markdown)
}

// override default heading_open render, add dom id attribute
// # h1 => <h1 id="h1">h1</h1>
md.renderer.rules.heading_open = function (tokens, idx, options, env, self) {
  // default impl:
  // ```js
  // return '<h' + tokens[idx].hLevel + '>';
  // ```
  var hLevel = tokens[idx].hLevel
  var nextToken = tokens[idx + 1]
  var raw = nextToken && nextToken.content
  if (!raw) {
    return "<h" + hLevel + ">"
  }

  return "<h" + hLevel + " id=\"" + id(raw) + "\">"
}

function id(str) {
  // replace " " and all punctuation characters to "-"
  str = str.toLowerCase().replace(/[\s\]\[\!\"\#\$\%\&\'\(\)\*\+\,\.\/\:\;\<\=\>\?\@\\\^\_\`\{\|\}\~\-]+/g, "-")
  try {
    return encodeURIComponent(str)
  } catch (e) {
    return str.replace(/[^\w]+/g, "-")
  }
}
