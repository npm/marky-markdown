module.exports = function (md, opts) {

  html_header = function (state, startLine, endLine, silent) {
    var ch, level, tmp, token, level,
	pos = state.bMarks[startLine] + state.tShift[startLine],
	max = state.eMarks[startLine];

    if (!state.md.options.html) { return false; }

    // Check start
    if (state.src.charCodeAt(pos) !== 0x3C/* < */ ||
	pos + 2 >= max) {
      return false;
    }

    // Quick fail on second char
    ch = state.src.charCodeAt(pos + 1);
    if (ch !== 104) {
      return false;
    }

    match = state.src.match(/<h[1-9]>/);
    if (!match) { return false; }
    level = parseInt(match[0][2]);

    end = state.src.match(new RegExp("</h"+String(level)+">"));
    if (!end) {return false;}

    state.line = startLine + 1;

    token        = state.push('heading_open', 'h' + String(level), 1);
    token.markup = '########'.slice(0, level);
    token.map    = [ startLine, state.line ];

    token          = state.push('inline', '', 0);
    token.content  = state.src.slice(pos+match.index+4, end.index).trim();
    token.map      = [ startLine, state.line ];
    token.children = [];

    token        = state.push('heading_close', 'h' + String(level), -1);
    token.markup = '########'.slice(0, level);
    
    return true;
  };

  md.block.ruler.before('html_block', 'html_header', html_header, ['paragraph', 'reference', 'blockquote']);
}
