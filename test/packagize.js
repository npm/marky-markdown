var packagize = require("../lib/packagize")
var readmes = require("./fixtures.js")

var packages = {
  wibble: {
    name: "wibble",
    description: "A package called wibble"
  },
  dangledor: {
    name: "dangledor",
    description: "dangledor need not roar"
  }
}

describe("packagize", function() {

  describe("package.name", function() {
    it("prepends package.name in an <h1>", function() {

    })

    it("add superfluous class to first <h1> if it's similar to package.name")

    it("leaves first <h1> if it differs from package.name")
  })

  describe("package.description", function() {
    it("prepends package.description in an <h2> with 'description' class")

    it("add superfluous class to first <p> if it's similar to package.description")

    it("leaves first <p> if it differs from package.description")
  })

  describe("package.repository", function() {
    it("rewrites relative URLs to fully-qualified GitHub URLs is package.repository is on GitHub")
  })

})
