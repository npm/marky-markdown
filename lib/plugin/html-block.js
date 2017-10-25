//https://regex101.com/r/cS4Ly1/3/
var EXTRACT_LANG_REGEX = /<pre(?:\s[^<|>]*?)lang=(?:'|")(\w+)(?:'|")/
//https://regex101.com/r/cS4Ly1/2
var EXTRACT_CONTENT_REGEX = /<pre(?:\s[^<|>]*?)>((.|\n)*)<\/pre>/
var langMap = {
  'javascript': 'js',
  'bash': 'sh'
}

var plugin = module.exports = function(md, opts) {
  var originalBlockRule = md.renderer.rules.html_block
  md.renderer.rules.html_block = function(tokens, idx, options, env, self) {
    var output = originalBlockRule.call(this, tokens, idx, options, env, self)
    if (tokens[idx].type === 'html_block') {
      var langMatches = tokens[idx].content.match(EXTRACT_LANG_REGEX)
      if (langMatches[1] === 'javascript' || langMatches[1] === 'bash') {
        var langName = langMap[langMatches[1]]
        var contentMatches = tokens[idx].content.match(EXTRACT_CONTENT_REGEX)
        tokens[idx].content = options.highlight(contentMatches[1].trim(), langName)
        
        var token = tokens[idx]
        var index = token.attrIndex('class')
        var attributes = token.attrs ? token.attrs.slice() : []
        var classes = options.langPrefix + ' ' + langName
        attributes.push(['class', classes])
    
        var fakeToken = {
          attrs: attributes
        }

        return '<' + plugin.tag + slf.renderAttrs(fakeToken) + '>' + output + '</' + plugin.tag + '>\n'
      }
    }
    return output
  }
}

plugin.tag = 'div'
