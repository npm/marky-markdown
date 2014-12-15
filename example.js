var marky = require("./")

// Clean up a regular old markdown string
var html = marky("# hello, I'm markdown").html()

// Or pass in an npm `package` object to do stuff like:
// - rewrite relative URLs to their absolute equivalent on github;
// - normalize package metadata with redundant readme content;
var html = marky("# hello, I am the foo readme", {
  package: {
    name: "foo"
    name: "foo is a thing"
    repository: {
      type: "git",
      url: "https://github.com/kung/foo"
    }
  }
}).html()
