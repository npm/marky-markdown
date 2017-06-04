module.exports = function (md, options) {
  // Unfortunately, there's no public API for getting access to the existing
  // installed parsing rules; rather than import the 'html_block' rule directly
  // from markdown-it just so we can wrap it with our custom logic here, we just
  // use internal utility methods to modify it in place at runtime.
  //
  // Normally, CommonMark HTML blocks are terminated by a blank line. However,
  // GitHub will terminate blocks early if the parser encounters Markdown in
  // subsequent lines even before it reaches a blank one. To match that
  // behavior, what we do here is:
  //
  //   1 Run the html_block rule to see if the current line is the start of an
  //     HTML block
  //
  //   2 If so, walk through the block line by line, running each line through
  //     each of the higher priority block rules (in validation mode, since
  //     we're only testing for matches) until we find either a blank line or a
  //     line that validates as one of those rules (e.g., a list, heading, etc...)
  //
  //   3 If we found a blank line or a markdown line, update the bounds and
  //     content of the html_block that was created in step 1 and reset
  //     state.line such that markdown-it will resume parsing from that point
  //
  // That means that this (among other things) works:
  //
  //   <img src="some/image.png"/>
  //   - the start of a list
  //   - the second item
  //   - etc
  //
  // ...whereas spec compliance requires a blank line between the two, because
  // CommonMark considers the entire thing to be a single HTML block.

  var ruler = md.block.ruler
  var ruleList = ruler.__rules__
  var originalEntry = ruleList[ruleIndex(ruler, 'html_block')]
  var originalRule = originalEntry.fn

  ruler.at('html_block', abstemiousHtmlBlock, {alt: originalEntry.alt})

  function abstemiousHtmlBlock (state, startLine, endLine, silent) {
    var resultUsingOriginalRule = originalRule.apply(this, arguments)
    if (silent || !resultUsingOriginalRule) return resultUsingOriginalRule

    // got an HTML block; fetch the higher precedence block rules
    var rules = ruleList.filter(isHigherPriorityRule(ruleIndex(ruler, 'html_block')))
    var context = this

    // walk through each line in the block looking for anything that works
    // as block type markdown
    for (var nextLine = startLine + 1; nextLine < endLine; nextLine++) {
      var start = state.bMarks[nextLine] + state.tShift[nextLine]
      var isBlank = start === state.eMarks[nextLine]
      var matched = rules.some(function (rule) { return ruleMatches(rule, state, nextLine, endLine, context) })

      if (isBlank || matched) {
        if (!silent) { updateParserState(state, startLine, nextLine) }
        break
      }
    }
    return true
  }

  function ruleIndex (rulerObject, ruleName) {
    return rulerObject.__find__(ruleName)
  }

  function isHigherPriorityRule (ruleIndex) {
    return function (rule, index) {
      // 'code' is a special case here; we exclude it from being able to break
      // up an HTML block without a blank line in between. If we left it in the
      // list of rules to check, then deeply nested markup (e.g., tables, div
      // inception, etc.) would be incorrectly turned into code blocks
      return rule.enabled && index < ruleIndex && rule.name !== 'code'
    }
  }

  function ruleMatches (rule, state, nextLine, endLine, context) {
    // run the rule in silent/validation mode to see if it matches
    return rule.fn.call(context, state, nextLine, endLine, true)
  }

  function updateParserState (state, startLine, endLine) {
    // rewrite the html_block token to stop on `endLine` and reset the parser
    // state so the next rule will resume at that line
    var token = state.tokens[state.tokens.length - 1]
    token.map = [startLine, endLine]
    token.content = state.getLines(startLine, endLine, state.blkIndent, true)
    state.line = endLine
  }
}
