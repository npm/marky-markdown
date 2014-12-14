var sanitizeHtml = require("sanitize-html")

module.exports = function(html) {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'img']),
    allowedAttributes: {
      h1: ['id'],
      h2: ['id'],
      h3: ['id'],
      h4: ['id'],
      h5: ['id'],
      h6: ['id'],
      a: ['href', 'id', 'name', 'target'],
      img: ['id', 'src']
    }
  })
}
