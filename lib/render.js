var pygmentize = require("pygmentize-bundled-cached")
var marked = module.exports = require("marked")

marked.setOptions({
  langPrefix: "highlight ",
  highlight: function (code, lang, callback) {
    pygmentize({lang: lang, format: "html"}, code, function (err, result) {
      callback(err, result.toString());
    })
  }
})
