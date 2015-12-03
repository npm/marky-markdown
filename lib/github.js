var gh = require('github-url-to-object')
var URL = require('url')
var path = require('path')

module.exports = function ($, pkg) {
  if (!pkg) return $
  if (!pkg.repository) return $

  var repo = gh(pkg.repository.url)

  if (!repo) return $

  $('img').each(function (i, el) {
    var src = $(this).attr('src')

    if (!src || !src.length) return

    var url = URL.parse(src)

    // Skip fully-qualified URLs
    if (url.host) return

    if (!url.path) return

    // Skip protocol-relative URLs
    if (url.path.match(/^\/\//)) return

    $(this).attr('src', 'https://raw.githubusercontent.com/' + path.join(
        repo.user,
        repo.repo,
        'master',
        url.href)
    )

  })

  $('a').each(function (i, el) {
    var href = $(this).attr('href')

    if (!href || !href.length) return

    var url = URL.parse(href)

    // Skip fully-qualified URLs
    if (url.host) return

    // Skip #hash fragments
    if (!url.path) return

    // Skip protocol-relative URLs
    if (url.path.match(/^\/\//)) return

    $(this).attr('href', repo.https_url + path.join('/blob/master/', url.href))

  })

  return $
}
