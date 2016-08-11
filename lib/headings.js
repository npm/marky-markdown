var cheerio = require('cheerio')
var GithubSlugger = require('github-slugger')
var tokenUtil = require('./token-util')

var headings = module.exports = function (md, options) {
  if (options && !options.prefixHeadingIds) {
    headings.prefix = ''
  } else {
    headings.prefix = headings.prefix || headings.defaultPrefix
  }

  var slugger = new GithubSlugger()
  var Token

  md.core.ruler.push('githubHeadings', function (state) {
    // save the Token constructor because we'll be building a few instances at render
    // time; that's sort of outside the intended markdown-it parsing sequence, but
    // since we have tight control over what we're creating (a link), we're safe
    if (!Token) {
      Token = state.Token
      tokenUtil.set(Token)
    }
  })

  md.renderer.rules.heading_open = function (tokens, idx, opts, env, self) {
    var children = tokens[idx + 1].children
    // make sure heading is not empty
    if (children && children.length) {
      // Generate an ID based on the heading's innerHTML; first, render without
      // converting gemoji strings to unicode emoji characters
      var rendered = md.renderer.renderInline(children.map(tokenUtil.unemoji), opts, env)
      var postfix = slugger.slug(
        cheerio.load(rendered).root().text()
          .replace(/[<>]/g, '') // In case the heading contains `<stuff>`
          .toLowerCase() // because `slug` doesn't lowercase
      )

      // add 3 new token objects link_open, text, link_close
      var linkOpen = new Token('link_open', 'a', 1)
      var text = new Token('text', '', 0)
      text.content = 'link'
      var linkClose = new Token('link_close', 'a', -1)

      // add some link attributes
      linkOpen.attrSet('id', headings.prefix + postfix)
      linkOpen.attrSet('class', headings.className)
      linkOpen.attrSet('href', '#' + postfix)

      // add new token objects as children of heading
      children.unshift(linkClose)
      children.unshift(text)
      children.unshift(linkOpen)
    }

    return md.renderer.renderToken(tokens, idx, options, env, self)
  }
}

headings.defaultPrefix = 'user-content-'
headings.className = 'deep-link'
