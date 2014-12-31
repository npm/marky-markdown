var hljs = require("highlight.js")
var marked = module.exports = require("marked")

marked.setOptions({
  langPrefix: "hljs ",
  highlight: function(code) {
    return hljs.highlightAuto(code).value;
  }
})
