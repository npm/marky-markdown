var pickBy = require('lodash.pickby')
var MD = require('markdown-it')
var lazyHeaders = require('markdown-it-lazy-headers')
var emoji = require('markdown-it-emoji')
var expandTabs = require('markdown-it-expand-tabs')
var githubTaskList = require('markdown-it-task-lists')

var cleanup = require('./cleanup')
var githubLinkify = require('./linkify')

var codeWrap = require('./plugin/code-wrap')
var headingLinks = require('./plugin/heading-links')
var gravatar = require('./plugin/gravatar')
var github = require('./plugin/github')
var youtube = require('./plugin/youtube')
var cdnImages = require('./plugin/cdn')
var badges = require('./plugin/badges')
var packagize = require('./plugin/packagize')
var relaxedLinkRefs = require('./gfm/relaxed-link-reference')
var githubHeadings = require('./gfm/indented-headings')
var overrideImageRenderer = require('./gfm/override-image-renderer')

if (typeof process.browser === 'undefined') {
  var Highlights = require('highlights')
  var highlighter = new Highlights()

  var languages = [
    'atom-language-nginx',
    'atom-language-diff',
    'language-dart',
    'language-rust',
    'language-erlang',
    'language-glsl',
    'language-haxe',
    'language-ini',
    'language-stylus'
  ]

  languages.forEach(function (language) {
    highlighter.requireGrammarsSync({
      modulePath: require.resolve(language + '/package.json')
    })
  })

  // cleanup generated rules in the highlighter registry if they are idle for 2000ms
  // they take a tremendous amount of memory if you process many languages in a server type environment.
  cleanup(highlighter.registry.grammars)
}

var render = module.exports = function (html, options) {
  var mdOptions = {
    html: true,
    langPrefix: 'highlight ',
    linkify: options.linkify
  }

  if (options.highlightSyntax) {
    mdOptions.highlight = function (code, lang) {
      return highlighter.highlightSync({
        fileContents: code,
        scopeName: scopeNameFromLang(highlighter, lang)
      })
    }
  }

  var parser = MD(mdOptions)
    .use(lazyHeaders)
    .use(emoji, {shortcuts: {}})
    .use(expandTabs, {tabWidth: 4})
    .use(githubTaskList)
    .use(headingLinks, options)
    .use(githubHeadings)
    .use(relaxedLinkRefs)
    .use(gravatar)
    .use(github, {package: options.package})
    .use(youtube)
    .use(badges)
    .use(packagize, {package: options.package})
    .use(overrideImageRenderer)

  if (options.highlightSyntax) parser.use(codeWrap)
  if (options.serveImagesWithCDN) parser.use(cdnImages, {package: options.package})

  return githubLinkify(parser).render(html)
}

var mappings = {
  sh: 'source.shell',
  markdown: 'source.gfm',
  erb: 'text.html.erb'
}

// attempt to look up by the long language name, e.g. Ruby, JavaScript.
// fallback to assuming that lang is the extension of the code snippet.
function scopeNameFromLang (highlighter, lang) {
  // alias language names.

  if (mappings[lang]) return mappings[lang]

  var grammar = pickBy(highlighter.registry.grammarsByScopeName, function (val, key) {
    return val.name.toLowerCase() === lang
  })

  if (Object.keys(grammar).length) {
    return Object.keys(grammar)[0]
  }

  var name = 'source.' + lang
  // mappings[lang] = name

  return name
}

render.renderPackageDescription = function (description) {
  return MD({html: true}).renderInline(description)
}
