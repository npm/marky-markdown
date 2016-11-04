var isUnorderedItem = function (line) {
  var match = line.match(/^( *)[-|\*|\+] /)
  return match
}

var isOrderedItem = function (line) {
  var match = line.match(/^( *)([1-9][0-9]*)\. /)
  return match
}

var prefixCodefence = function (line) {
    if (line.length < 3) return 0

    // This is how it looks in redcarpet and I didn't feel like making it better
    var i = 0
    if (line[0] == ' ') {
	i++
	if (line[1] == ' ') {
	    i++
	    if (line[2] == ' ') {
		i++
	    }
	}
    }

    if (i + 2 >= line.length || !(line[i] == '~' || line[i] == '`')) {
	return 0
    }

    // Make sure fence extends to the end of the line
    var fenceChar = line[i]
    var n = 0
    while (i < line.length && line[i] == fenceChar) {
	n++
	i++
    }

    if (n < 3) return 0

    return i
}

var isCodefence = function (line) {
    var i = prefixCodefence(line)
    if (i == 0) return 0

    while (i < line.length && line[i] == ' ') i++

    var languageStart = i
    var languageLength = 0;
    if (i < line.length && line[i] == '{') {
	i++
	languageStart++

	while (i < line.length && line[i] != '}' && line[i] != '\n') {
	    i++
	    languageLength++
	}

	if (i == line.length || line[i] != '}') return 0

	while (languageLength > 0 && line[languageStart] == ' ') {
	    languageStart++
	    languageLength--
	}

	while (languageLength > 0 && line[languageStart + languageLength - 1] == ' ') {
	    languageLength++
	}

	i++
    } else {
	while (i < line.length && line[i] != ' ') {
	    languageLength++
	    i++
	}
    }

    while (i < line.length && line[i] != '\n') {
	if (line[i] != ' ') return 0
	i++
    }

    return i+1
}

var hRule = function (line) {
  var stripped = line.trim()
  var c = stripped[0]
  if (c !== '-' && c !== '*' && c !== '+') return false

  var n = 0
  for (var i = 0; i < stripped.length; i++) {
    if (stripped[i] === c) n++
    else if (stripped[i] !== ' ') return false
  }

  return n >= 3
}

module.exports = function (md, opts) {
  var listItemParser = function (state, startLine, endLine, silent) {
    var originalIndent = Math.min(state.sCount[state.line], 3)
      var line = state.src.slice(state.bMarks[state.line], state.eMarks[state.line])
      console.log(line)

    var lineStart = isOrderedItem(line) || isUnorderedItem(line)

    if (!lineStart) return false

    var ordered = isOrderedItem(line)
    var markChar
    if (ordered) {
      markChar = '.'
    } else {
      markChar = line.trim()[0]
    }

    state.bMarks[state.line] += lineStart[0].length

    var unorderedPos
    var orderedPos
    var inEmpty = 0
    var emptyInside = 0
    var indent
      var sublist
      var inFence = false
    var lineIndex = state.line + 1
      var finished = false
      var i

    while (lineIndex < endLine) {
	line = state.src.slice(state.bMarks[lineIndex], state.eMarks[lineIndex])
	console.log(line)

      if (line.trim() === '') {
        inEmpty = 1
        lineIndex++
        continue
      }

	indent = Math.min(4, state.sCount[lineIndex])

	if (isCodefence(line) != 0) inFence = !inFence

	if (!inFence) {
	    unorderedPos = isUnorderedItem(line)
	    orderedPos = isOrderedItem(line)
	}

	if (inEmpty && ((ordered && unorderedPos) || (!ordered && orderedPos))) {
	    finished = true
	    break
	}

      // Check whether the line is a horizontal rule because the same characters are used for that
      if ((unorderedPos && !hRule(line)) || orderedPos) {
        if (inEmpty) emptyInside = 1
        // Reached original level in the list. Break out so that the other elements get parsed in listParser
        if (indent === originalIndent) break

        if (!sublist) {
          sublist = lineIndex
        }
      } else if (inEmpty && indent < 4 && line[0] !== '\t') {
        finished = true
        break
      } else if (inEmpty) {
          emptyInside = 1
	  console.log('empty inside')
      }

      // Notice that this algorithm actually removes up to four spaces from the start of all lines it parses. This results in strange behavior such as decreases in indentation increasing the bullet level
	state.bMarks[lineIndex] += indent
	state.sCount[lineIndex] -= indent
      lineIndex++
    }

    var token

    // An internal empty line determines whether this list item is parsed as a block or inline. This is what causes most of the weird behavior
    token = state.push('list_item_open', 'li', 1)
    token.markup = markChar
    token.map = [startLine, 0]
      state.line = startLine
      state.pos = state.bMarks[startLine]
      var oldMax = state.lineMax
      var oldPosMax = state.posMax
      if (emptyInside || finished) {
	  if (sublist && sublist < endLine) {
	      state.lineMax = sublist
	      state.md.block.tokenize(state, startLine, sublist)
	      token = state.push('list_item_close', 'li', -1)
	      token.markup = markChar
	      state.line = sublist
	      state.lineMax = lineIndex
	      state.md.block.tokenize(state, sublist, lineIndex)
	  } else {
	      state.lineMax = lineIndex
	      state.md.block.tokenize(state, startLine, lineIndex)
	      token = state.push('list_item_close', 'li', -1)
	      token.markup = markChar
	  }
      } else {
	  if (sublist && sublist < endLine) {
	      token = state.push('inline', '', 0)
	      token.content = state.src.slice(state.bMarks[startLine], state.bMarks[sublist]).trim()
	      token.map = [startLine, sublist]
	      token.children = []
	      token = state.push('list_item_close', 'li', -1)
	      token.markup = markChar
	      state.line = sublist
	      state.lineMax = lineIndex
	      state.md.block.tokenize(state, sublist, lineIndex)
	  } else {
	      token = state.push('inline', '', 0)
	      token.content = state.src.slice(state.bMarks[startLine], state.bMarks[lineIndex]).trim()
	      token.map = [startLine, lineIndex]
	      token.children = []
	      token = state.push('list_item_close', 'li', -1)
	      token.markup = markChar
	  }
      }
      
      state.lineMax = oldMax
      state.posMax = oldPosMax
    state.line = lineIndex

    return !finished
  }

  var listParser = function (state, startLine, endLine, silent) {
    var line = state.src.slice(state.bMarks[state.line], state.eMarks[state.line])
    if (!isOrderedItem(line) && !isUnorderedItem(line)) return false

    var token
    var keepGoing = true

    var ordered = isOrderedItem(line)

    if (ordered) {
      token = state.push('ordered_list_open', 'ol', 1)
      token.markup = '.'
    } else {
      token = state.push('bullet_list_open', 'ul', 1)
      token.markup = line.trim()[0]
    }
    token.map = [startLine, 0]

    while (state.line < endLine && keepGoing) {
      keepGoing = listItemParser(state, state.line, endLine, silent)
    }

    if (ordered) {
      token = state.push('ordered_list_close', 'ol', -1)
      token.markup = '.'
    } else {
      token = state.push('bullet_list_close', 'ul', -1)
      token.markup = line.trim()[0]
    }

    return true
  }

  md.block.ruler.before('list', 'ghlist', listParser, ['paragraph', 'reference', 'blockquote'])
}
