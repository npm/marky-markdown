var marky = require("./")

// Here's my basic API
marky(inputString, [optionsObject], nodeStyleCallback)

// Clean up a regular old markdown string
marky("# hello, I'm markdown", function(err, $){
  console.log($.html())
})

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
  {package: package},
  function(err, $) {
    console.log($.html())
  }
)

// Syntax highlighting is disabled by default.
// To turn it on:

marky(
  "# I'm a file with github flavored markdown",
  {highlightSyntax: false},
  function(err, $) {
    console.log($.html())
  }
)

// Pass in a `debug` for verbose output
marky(
  "# hello, I'm an evil document",
  {debug: true},
  function(err, $) {
    console.log($.html())
  }
)
