var sanitizeHtml = require('sanitize-html')
var sanitizer = module.exports = function (html) {
  return sanitizeHtml(html, sanitizer.config)
}

sanitizer.config = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'div', 'h1', 'h2', 'img', 'meta', 'pre', 'span', 'iframe'
  ]),
  allowedClasses: {
    code: [
      'highlight',
      'hljs',
      'bash',
      'css',
      'coffee',
      'coffeescript',
      'glsl',
      'http',
      'js',
      'javascript',
      'json',
      'lang-html',
      'sh',
      'shell',
      'typescript',
      'xml'
    ],
    div: ['line'],
    h1: ['deep-link'],
    h2: ['deep-link'],
    h3: ['deep-link'],
    h4: ['deep-link'],
    h5: ['deep-link'],
    h6: ['deep-link'],
    pre: ['editor', 'editor-colors'],
    span: require('highlights-tokens')
  },
  allowedAttributes: {
    h1: ['id'],
    h2: ['id'],
    h3: ['id'],
    h4: ['id'],
    h5: ['id'],
    h6: ['id'],
    a: ['href', 'id', 'name', 'target'],
    img: ['id', 'src'],
    meta: ['name', 'content'],
    iframe: ['src', 'frameborder', 'allowfullscreen'],
    div: [],
    span: [],
    pre: []
  },
  exclusiveFilter: function (frame) {
    // Allow YouTube iframes
    if (frame.tag !== 'iframe') return false
    return !String(frame.attribs.src).match(/\/\/(www\.)?youtube\.com/)
  }
}
