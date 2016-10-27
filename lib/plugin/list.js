var isUnorderedItem = function (line) {
    var match = line.match(/^( *)[-|\*|\+] /)
    return match
}

var isOrderedItem = function (line) {
    var match = line.match(/^( *)([1-9][0-9]*)\. /)
    return match
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
	var originalIndent = Math.min(state.sCount[state.line], 4)
	var line = state.src.slice(state.bMarks[state.line], state.eMarks[state.line])

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
	var lineIndex = state.line
	var finished = false

	while (lineIndex < endLine) {
	    line = state.src.slice(state.bMarks[lineIndex], state.eMarks[lineIndex])

	    if (line.trim() === '') {
		inEmpty = 1
		continue
	    }
	    
	    unorderedPos = isUnorderedItem(line)
	    orderedPos = isOrderedItem(line)

	    indent = Math.min(state.sCount[lineIndex], 4)

	    // Check whether the line is a horizontal rule because the same characters are used for that
	    if ((unorderedPos && !hRule(line)) || orderedPos) {
		if (inEmpty) emptyInside = 1

		// Reached original level in the list. Break out so that the other elements get parsed in listParser
		if (indent == originalIndent) break

		if (!sublist) sublist = lineIndex
	    } else if (inEmpty && indent < 4 && line[0] !== '\t') {
		finished = true
		break
	    } else if (inEmpty) {
		emptyInside = 1
	    }

	    // Notice that this algorithm actually removes up to four spaces from the start of all lines it parses. This results in strange behavior such as decreases in indentation increasing the bullet level
	    state.bMarks[lineIndex] += indent
	    state.sCount[lineIndex] -= indent
	    lineIndex++
	}

	var token

	// An internal empty line determines whether this list item is parsed as a block or inline. This is what causes most of the weird behavior
	if (emptyInside) {
	    token = state.push('list_item_open', 'li', 1)
	    token.markup = markChar
	    token.map = [startLine, 0]
	    if (sublist && sublist < endLine) {
		state.md.block.tokenize(state, startLine, sublist, true)
		token = state.push('list_item_close', 'li', -1)
		token.markup = markChar
		state.md.block.tokenize(state, sublist, endLine, true)
	    } else {
		state.md.block.tokenize(state, startLine, endLine, true)
		token = state.push('list_item_close', 'li', -1)
		token.markup = markChar
	    }
	} else {
	    token = state.push('list_item_open', 'li', 1)
	    token.markup = markChar
	    token.map = [startLine, 0]
	    if (sublist && sublist < endLine) {
		state.md.inline.tokenize(state, startLine, sublist, true)
		token = state.push('list_item_close', 'li', -1)
		token.markup = markChar
		state.md.block.tokenize(state, sublist, endLine, true)
	    } else {
		state.md.inline.tokenize(state, startLine, endLine, true)
		token = state.push('list_item_close', 'li', -1)
		token.markup = markChar
	    }
	}	

	return !finished
    }
    
    var listParser = function (state, startLine, endLine, silent) {
	var buffer = []
	var emptyLines = 0
	var line = state.src.slice(state.bMarks[state.line], state.eMarks[state.line])
	if (!isOrderedItem(line) && !isUnorderedItem(line)) return false

	var token
	var keepGoing = true

	var originalIndent = state.sCount[state.line]
	var ordered = isOrderedItem(line)

	if (ordered) {
	    token = state.push('ordered_list_open', 'ol', 1)
	    token.markup = '.'
	} else {
	    token = state.push('bullet_list_open', 'ul', 1);
	    token.markup = line.trim()[0]
	}
	token.map = [startLine, 0]

	while (state.line < endLine && keepGoing) {
	    keepGoing = listItemParser(state, state.line, endLine, silent)
	}

	if (ordered) {
	    token = state.push('ordered_list_close', 'ol', 1)
	    token.markup = '.'
	} else {
	    token = state.push('bullet_list_close', 'ul', 1);
	    token.markup = line.trim()[0]
	}
    }

    md.block.ruler.before('list', 'ghlist', listParser, ['paragraph', 'reference', 'blockquote'])
}
