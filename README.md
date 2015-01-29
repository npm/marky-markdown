# marky-markdown

The thing [npmjs.com](https://www.npmjs.com) uses to clean up READMEs and other markdown files.

## What it does

- Parses markdown with [markdown-it](https://github.com/markdown-it/markdown-it), a fast and [commonmark-compliant](http://commonmark.org/) parser.
- Removes broken and malicious user input with [sanitize-html](https://www.npmjs.com/package/sanitize-html)
- Applies syntax highlighting to [GitHub-flavored code blocks](https://help.github.com/articles/github-flavored-markdown/#fenced-code-blocks) using the [highlights](https://www.npmjs.com/package/highlights) library from [Atom](https://atom.io/).
- Converts headings (h1, h2, etc) into anchored hyperlinks.
- Converts relative GitHub links to their absolute equivalents.
- Converts relative GitHub images sources to their GitHub raw equivalents.
- Converts insecure Gravatar URLs to HTTPS.
- Wraps embedded YouTube videos so they can be styled.
- Parses and sanitizes `package.description` as markdown.
- Applies CSS classes to redundant content that closely matches npm package name and description.
- Applies CSS classes to badge images, so we can do something interesting with them one day.

## Installation

```sh
npm install marky-markdown --save
```

## Programmatic Usage

```js
var marky = require("marky-markdown")
var marky = require("./")

// Here's my basic API
marky(inputString, [optionsObject])

// Clean up a regular old markdown string
marky("# hello, I'm markdown").html()

// Pass in an npm `package` object to do stuff like
// rewriting relative URLs to their absolute equivalent on github,
// normalizing package metadata with redundant readme content,
// etcs
var package = {
  name: "foo"
  name: "foo is a thing"
  repository: {
    type: "git",
    url: "https://github.com/kung/foo"
  }
}

marky(
  "# hello, I am the foo readme",
  {package: package}
).html()

// Syntax highlighting is disabled by default.
marky(
  "# I'm a file with github flavored markdown",
  {highlightSyntax: true}
).html()

// Pass in a `debug` for verbose output
marky(
  "# hello, I'm an evil document",
  {debug: true},
).html()
```

## Command-line Usage

You can use marky-markdown to parse markdown files in the shell.
The easiest way to do this is to install globally:

```
npm i -g marky-markdown
marky-markdown some.md > some.html
```

## Tests

```sh
npm install
npm test
```

## Dependencies

- [cheerio](https://github.com/cheeriojs/cheerio): Tiny, fast, and elegant implementation of core jQuery designed specifically for the server
- [escape-html](https://github.com/component/escape-html): Escape HTML entities
- [github-url-to-object](https://github.com/zeke/github-url-to-object): Extract user, repo, and other interesting properties from GitHub URLs
- [highlights](https://github.com/atom/highlights): Syntax highlighter
- [highlights-tokens](https://github.com/zeke/highlights-tokens): A list of the language tokens used by the Atom.app [highlights](https://www.npmjs.com/package/highlights) syntax highlighter
- [html-frontmatter](https://github.com/zeke/html-frontmatter): Extract key-value metadata from HTML comments
- [js-beautify](https://github.com/beautify-web/js-beautify): jsbeautifier.org for node
- [lodash](https://github.com/lodash/lodash): A utility library delivering consistency, customization, performance, &amp; extras.
- [markdown-it](https://github.com/markdown-it/markdown-it): Markdown-it - modern pluggable markdown parser.
- [marked](https://github.com/chjj/marked): A markdown parser built for speed
- [pretty](https://github.com/jonschlinkert/pretty): Some tweaks for beautifying HTML with js-beautify according to my preferences.
- [sanitize-html](https://github.com/punkave/sanitize-html): Clean up user-submitted HTML, preserving whitelisted elements and whitelisted attributes on a per-element basis
- [similarity](https://github.com/zeke/similarity): How similar are these two strings?
- [string](https://github.com/jprichardson/string.js): string contains methods that aren&#39;t included in the vanilla JavaScript string such as escaping html, decoding html entities, stripping tags, etc.

## License

ISC
