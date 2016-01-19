var URL = require('url')
var path = require('path')
var cdnHost = 'https://cdn.npm.im'

module.exports = function ($, pkg) {
  if (!pkg) return $
  if (!pkg.name) return $
  if (!pkg.version) return $

  $('img').each(function (i, el) {
    var url = URL.parse($(this).attr('src'))

    // Skip fully-qualified URLs
    if (url.host) return

    // Skip protocol-relative URLs
    if (url.path.match(/^\/\//)) return

    $(this).attr('src', cdnHost + '/' + pkg.name + '@' + pkg.version + path.join('/', url.href))
  })

  return $
}
