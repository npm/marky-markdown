// Remove HTML comments so as not to confuse the markdown parser
module.exports = function (html) {
  return html.replace(/<!--[\s\S]*?-->/g, '')
}
