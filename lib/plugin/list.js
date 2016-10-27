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
	var originalIndent = Math.min(state.sCount[state.line], 3)
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
	var lineIndex = state.line + 1
	var finished = false

	while (lineIndex < endLine) {
	    line = state.src.slice(state.bMarks[lineIndex], state.eMarks[lineIndex])

	    if (line.trim() === '') {
		inEmpty = 1
		lineIndex++
		continue
	    }
	    
	    unorderedPos = isUnorderedItem(line)
	    orderedPos = isOrderedItem(line)

	    indent = Math.min(state.sCount[lineIndex], 3)

	    // Check whether the line is a horizontal rule because the same characters are used for that
	    if ((unorderedPos && !hRule(line)) || orderedPos) {
		if (inEmpty) emptyInside = 1

		// Reached original level in the list. Break out so that the other elements get parsed in listParser
		if (indent == originalIndent) break

		if (!sublist) {
		    sublist = lineIndex
//		    console.log('Sublist starts at |' + line)
		}
	    } else if (inEmpty && indent < 4 && line[0] !== '\t') {
		finished = true
		break
	    } else if (inEmpty) {
		emptyInside = 1
	    }

	    // Notice that this algorithm actually removes up to four spaces from the start of all lines it parses. This results in strange behavior such as decreases in indentation increasing the bullet level
//	    console.log('Cutting |' + line + '| to |' + line.slice(indent))
	    state.bMarks[lineIndex] += indent
	    state.sCount[lineIndex] -= indent
	    lineIndex++
	}

	var token

	// An internal empty line determines whether this list item is parsed as a block or inline. This is what causes most of the weird behavior
//	if (emptyInside) {
	token = state.push('list_item_open', 'li', 1)
	token.markup = markChar
	token.map = [startLine, 0]
	state.line = startLine
	var oldMax = state.lineMax
	if (sublist && sublist < endLine) {
//	    console.log('startLine: ' + String(startLine))
//	    console.log('sublist: ' + String(sublist))
//	    console.log('endLine: ' + String(lineIndex))
	    state.lineMax = sublist
	    state.md.block.tokenize(state, startLine, sublist)
	    state.line = sublist
	    token = state.push('list_item_close', 'li', -1)
	    token.markup = markChar
	    state.lineMax = lineIndex
	    state.md.block.tokenize(state, sublist, lineIndex)
	} else {
	    state.lineMax = lineIndex
	    state.md.block.tokenize(state, startLine, lineIndex)
	    token = state.push('list_item_close', 'li', -1)
	    token.markup = markChar
	}
	state.lineMax = oldMax
/*	} else {
	    token = state.push('list_item_open', 'li', 1)
	    token.markup = markChar
	    token.map = [startLine, 0]
	    if (sublist && sublist < endLine) {
		state.posMax = state.bMarks[sublist]
		state.pos = state.bMarks[startLine]
		state.md.inline.tokenize(state)
		token = state.push('list_item_close', 'li', -1)
		token.markup = markChar
		state.md.block.tokenize(state, sublist, endLine)
	    } else {
		console.log('hello')
		state.posMax = state.bMarks[endLine]
		state.pos = state.bMarks[startLine]
		state.md.inline.tokenize(state)
		token = state.push('list_item_close', 'li', -1)
		token.markup = markChar
	    }
	}	
*/
	state.line = lineIndex
	
	return !finished
    }
    
    var listParser = function (state, startLine, endLine, silent) {
//	console.log('Calling parser on line: ' + String(startLine))
	var buffer = []
	var emptyLines = 0
	var line = state.src.slice(state.bMarks[state.line], state.eMarks[state.line])
//	console.log(line)
	if (!isOrderedItem(line) && !isUnorderedItem(line)) return false
//	console.log('Passed')

	var token
	var keepGoing = true

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
	    token = state.push('ordered_list_close', 'ol', -1)
	    token.markup = '.'
	} else {
	    token = state.push('bullet_list_close', 'ul', -1);
	    token.markup = line.trim()[0]
	}
//	console.log()

	return true
    }

    md.block.ruler.before('list', 'ghlist', listParser, ['paragraph', 'reference', 'blockquote'])
}
