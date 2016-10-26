var imageRule = require('../rules/inline_rules/image')

module.exports = function (md, options) {
  // Unfortunately, there's no public API for getting access to the existing
  // installed parsing rules; rather than import the 'reference' rule directly
  // from markdown-it just so we can re-install it into the parser with the
  // 'alt' chain set up correctly, here we're just using internal utility
  // methods to modify it in place at runtime.
  //
  // Override the markdown-it image rule to allow spaces in src attribute:
  //  e.g., ![Gitter](https://badges.gitter.im/Join Chat.svg)
  //
  // Unfortunately, there was no way to hook into the parsing of the src
  // attribute, or "link destination", for image elements.

  var ruler = md.inline.ruler
  // Note: location of original rule below
  //  i.e., `var originalRule = ruler.__rules__[ruler.__find__('image')].fn`

  ruler.at('image', function (state, startLine, endLine, silent) {
    return imageRule.apply(this, arguments)
  })
}
