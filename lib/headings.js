var cheerio = require('cheerio')
var GithubSlugger = require('github-slugger')
var tokenUtil = require('./token-util')

function isMarkdownLink (token) {
  return token.type === 'link_open'
}

function isHtmlLink (token) {
  return token.type === 'html_inline' && token.content.substring(0, 3).toLowerCase() === '<a '
}

var headings = module.exports = function (md, options) {
  if (options && !options.prefixHeadingIds) {
    headings.prefix = ''
  } else {
    headings.prefix = headings.prefix || headings.defaultPrefix
  }

  var savedTokenConstructor = false
  var originalRenderRule = md.renderer.rules.heading_open
  var slugger = new GithubSlugger()

  md.core.ruler.push('githubHeadings', function (state) {
    // save the Token constructor because we'll be building a few instances at render
    // time; that's sort of outside the intended markdown-it parsing sequence, but
    // since we have tight control over what we're creating (a link), we're safe
    if (!savedTokenConstructor) {
      tokenUtil.set(state.Token)
      savedTokenConstructor = true
    }
  })

  md.renderer.rules.heading_open = function (tokens, idx, opts, env, self) {
    // Bail if heading already contains a hyperlink
    var children = tokens[idx + 1].children
    if (children && children.length) {
      if (children.filter(isMarkdownLink).length === 0) {
        // Generate an ID based on the heading's innerHTML; first, render without
        // converting gemoji strings to unicode emoji characters
        var rendered = md.renderer.renderInline(children.map(tokenUtil.unemoji), opts, env)
        var postfix = slugger.slug(
          cheerio.load(rendered).root().text()
            .replace(/[<>]/g, '') // In case the heading contains `<stuff>`
            .toLowerCase() // because `slug` doesn't lowercase
        )

        // add some heading attributes
        tokens[idx].attrSet('id', headings.prefix + postfix)
        tokens[idx].attrJoin('class', headings.className)

        // if the heading doesn't already contain a link, wrap the contents in one
        if (children.filter(isHtmlLink).length === 0) {
          tokenUtil.wrap(children, postfix)
        }
      }
    }

    if (originalRenderRule) {
      return originalRenderRule.call(this, tokens, idx, options, env, self)
    } else {
      return md.renderer.renderToken(tokens, idx, options, env, self)
    }
  }
}

headings.defaultPrefix = 'user-content-'
headings.className = 'deep-link'
