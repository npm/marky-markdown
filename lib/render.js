var pygmentize = require("pygmentize-bundled")
var marked = module.exports = require("marked")

marked.setOptions({
  langPrefix: "hljs ",
  highlight: function (code, lang, callback) {
    pygmentize({lang: lang, format: "html"}, code, function (err, result) {
      callback(err, result.toString());
    })
  }
})
