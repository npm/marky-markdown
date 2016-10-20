// markdown-it plugin to rewrite image and link URLs to be static github URLs
// when the calling code provides github repository information
//
var gh = require('github-url-to-object')
var URL = require('url')
var path = require('path')

module.exports = function (md, opts) {
  if (!opts) return
  if (!opts.package) return
  if (!opts.package.repository) return

  var repo = gh(opts.package.repository.url)

  if (!repo) return

  // rewrite image locations to be fully qualified github URLs
  var originalImageRule = md.renderer.rules.image
  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    var src = tokens[idx].attrGet('src')

    if (src && src.length) {
      var url = URL.parse(src)

      // Skip fully-qualified URLs, #hash fragments, and protocol-relative URLs
      if (!url.host && url.path && !url.path.match(/^\/\//)) {
        tokens[idx].attrSet('src', 'https://raw.githubusercontent.com/' + path.join(
            repo.user,
            repo.repo,
            'master',
            url.href)
        )
      }
    }
    return originalImageRule.call(this, tokens, idx, options, env, self)
  }

  // rewrite link hrefs to be fully qualified github URLs
  var originalLinkRule = md.renderer.rules.link_open
  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    var href = tokens[idx].attrGet('href')

    if (href && href.length) {
      var url = URL.parse(href)

      // Skip fully-qualified URLs, #hash fragments, and protocol-relative URLs
      if (!url.host && url.path && !url.path.match(/^\/\//)) {
        tokens[idx].attrSet('href', repo.https_url + path.join('/blob/master/', url.href))
      }
    }
    if (originalLinkRule) {
      return originalLinkRule.call(this, tokens, idx, options, env, self)
    } else {
      return md.renderer.renderToken(tokens, idx, options)
    }
  }
}
