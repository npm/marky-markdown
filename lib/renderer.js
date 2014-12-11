var hljs = require("highlight.js")
var marked = require("marked")

// Markdown Syntax Highlighting
// See https://github.com/chjj/marked/pull/418
var renderer = new marked.Renderer();
renderer.code = function(code, language){
  return fmt(
    "<pre><code class=\"hljs %s\">%s</code></pre>",
    language,
    hljs.highlight(language, code).value
  )
};
