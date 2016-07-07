var sanitizeHtml = require('sanitize-html')
var sanitizer = module.exports = function (html) {
  return sanitizeHtml(html, sanitizer.config)
}

sanitizer.config = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'dd', 'del', 'div', 'dl', 'dt', 'h1', 'h2', 'iframe', 'img', 'input', 'ins', 'meta', 'pre', 's', 'span', 'sub', 'sup'
  ]),
  allowedClasses: {
    div: [
      'highlight',
      'hljs',
      'bash',
      'css',
      'coffee',
      'coffeescript',
      'diff',
      'glsl',
      'http',
      'js',
      'javascript',
      'json',
      'lang-html',
      'line',
      'sh',
      'shell',
      'typescript',
      'xml'
    ],
    h1: ['deep-link'],
    h2: ['deep-link'],
    h3: ['deep-link'],
    h4: ['deep-link'],
    h5: ['deep-link'],
    h6: ['deep-link'],
    input: ['task-list-item-checkbox'],
    li: ['task-list-item'],
    ol: ['task-list'],
    pre: ['editor', 'editor-colors'],
    span: require('./highlights-tokens'),
    ul: ['task-list']
  },
  allowedAttributes: {
    h1: ['id'],
    h2: ['id'],
    h3: ['id'],
    h4: ['id'],
    h5: ['id'],
    h6: ['id'],
    a: ['href', 'id', 'name', 'target'],
    img: ['id', 'src', 'width', 'height', 'valign'],
    meta: ['name', 'content'],
    iframe: ['src', 'frameborder', 'allowfullscreen'],
    input: ['checked', 'class', 'disabled', 'type'],
    div: ['id'],
    span: [],
    pre: [],
    td: ['colspan', 'rowspan'],
    th: ['colspan', 'rowspan'],
    del: ['cite', 'datetime'],
    ins: ['cite', 'datetime']
  },
  exclusiveFilter: function (frame) {
    // Allow Task List items
    if (frame.tag === 'input') {
      var isTaskItem = (frame.attribs.class && frame.attribs.class.indexOf('task-list-item-checkbox') > -1)
      var isCheckbox = (frame.attribs.type && frame.attribs.type === 'checkbox')
      var isDisabled = frame.attribs.hasOwnProperty('disabled')
      return !(isTaskItem && isCheckbox && isDisabled)
    }

    // Allow YouTube iframes
    if (frame.tag !== 'iframe') return false
    return !String(frame.attribs.src).match(/^(https?:)?\/\/(www\.)?youtube\.com/)
  }
}
