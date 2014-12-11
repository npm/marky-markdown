var sanitizer       = require("sanitizer")
var ghurl           = require("github-url-to-object")
var url             = require("url")

// Remove unsafe HTML and convert relative GitHub
// URLs to their fully-qualified equivalents
var sanitize = module.exports = function(html, package) {
  return sanitizer.sanitize(p, urlPolicy(package))
}

var urlPolicy = function(package) {

  var gh = package && package.repository ? ghurl(package.repository.url) : null

  return function(u, effect, ltype, hints) {

    // relative URL?
    if (u.scheme_ === null && u.domain_ === null) {

      if (!gh) return null

      // temporary fix for relative links in github readmes, until a more general fix is needed
      var v = gh.https_url

      if (u.path_) {
        if (hints && hints.XML_TAG === 'a') {
          // if the tag is an anchor, we can link to the github html
          v.pathname = v.pathname + '/blob/master/' + u.path_;
        } else {
          // else we link to the raw file
          v.pathname = v.pathname + '/raw/master/' + u.path_;
        }
      }
      u = {
        protocol: v.protocol,
        host: v.host,
        pathname: v.pathname,
        query: u.query_,
        hash: u.fragment_
      }
    } else {
      u = {
        protocol: u.scheme_ + ':',
        host: u.domain_ + (u.port_ ? ':' + u.port_ : ''),
        pathname: u.path_,
        query: u.query_,
        hash: u.fragment_
      }
    }

    // take a bath
    u = url.parse(url.format(u))

    if (!u) return null

    // use encrypted gravatars
    if (u.protocol === 'http:' && u.hostname && u.hostname.match(/gravatar\.com$/)) {
      return url.format('https://secure.gravatar.com' + u.pathname)
    }

    return url.format(u)
  }
}
