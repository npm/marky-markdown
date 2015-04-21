var marky = require('./')

// Clean up a regular old markdown string
marky("# hello, I'm markdown").html()

// Pass in an npm `package` object to do stuff like
// rewriting relative URLs to their absolute equivalent on github,
// normalizing package metadata with redundant readme content,
// etcs
var pkg = {
  name: 'foo is a thing',
  repository: {
    type: 'git',
    url: 'https://github.com/kung/foo'
  }
}

marky(
  '# hello, I am the foo readme',
  {package: pkg}
).html()

// Disable syntax highlighting
marky(
  "# I'm a file with github flavored markdown",
  {highlightSyntax: false}
).html()

// Pass in a `debug` for verbose output
marky(
  "# hello, I'm an evil document",
  {debug: true}
).html()
