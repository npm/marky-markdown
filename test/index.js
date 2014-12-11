var assert = require("assert")
var fixtures = require("./fixtures.js")
var marky = require("..")

describe("fixtures", function() {

  it("is a key-value object", function(){
    assert(fixtures)
    assert(typeof fixtures === "object")
    assert(!Array.isArray(fixtures))
  })

  it("contains stringified markdown files as values", function(){
    var keys = Object.keys(fixtures)
    assert(keys.length)
    keys.forEach(function(key) {
      assert(fixtures[key])
      assert(typeof fixtures[key] === "string")
    })
  })

})

describe("marky-markdown", function() {

  it("is a function", function(){
    assert(marky)
    assert(typeof marky === "function")
  })

  it("accepts a markdown string and returns an HTML string", function(){
    var output = marky(fixtures.basic)
    assert.equal(basic, "<h1 id=\"hello-world\">hello world</h1>")
  })

  it("throws an error if first argument is not a string", function(){
    var errorPattern = new RegExp("first argument must be a string", "i")
    assert.throws(function() { marky(null) }, errorPattern)
    assert.throws(function() { marky([1,2,3]) }, errorPattern)
    assert.throws(function() { marky({a:1,b:2}) }, errorPattern)
  })

  it("throws an error if second argument is present but isn't an object", function(){
    var errorPattern = new RegExp("options must but an object", "i")
    assert.throws(function() { marky("this is a test", "wtf") }, errorPattern)
  })

  it("replaces relative image URLs with npm CDN URLs")

  it("replaces insecure gravatar img src URLs with secure HTTPs URLs", function() {
    // Make sure the fixture contains an insecure URL first
    assert(fixtures.gravatar.match("http://gravatar.com/avatar/123?s=50&d=retro"))

    var $ = marky(fixtures.gravatar)
    var images = $("img")
    assert.equal(images.length, 2)
    assert.equal(images[0].attr('src'), "https://secure.gravatar.com/avatar/123?s=50&d=retro")
    assert.equal(images[1].attr('src'), "https://secure.gravatar.com/avatar/456?s=50&d=retro")
  })

  it("adds a 'badge' class to <p> tags containing badge images", function() {
    var $ = marky(fixtures.badges)
    var ps = $("p")
    assert($("p:has(img)").length)
    assert($("p:has(img[src*='nodei.co'])").length)
    assert($("p:has(img[src*='nodei.co'])").hasClass("badge"))
    assert.equal($("p"), $("p:has(img.badge)"))
  }

  describe("syntax highlighting", function() {
    it("converts github flavored markdown GFM to <code> blocks")

    it("adds 'lang-js' class to javascript blocks")

    it("adds 'lang-sh' class to shell blocks")

    it("adds 'hljs' class to all blocks")
  })

  it("rewrites HTML frontmatter as <meta> tags")

  it("supports deep linking by injecting <a> tags into headings that have DOM ids")

})


describe("sanitize", function(){
  
})

describe("packagize", function() {

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

  describe("name", function() {

    it("prepends an h1.package-name element into readme with value of package.name", function(){
      var $ = marky(fixtures.wibble, {package: packages.wibble})
      assert.equal(
        $("h1.package-name").text(),
        packages.wibble.name
      )
    })

    it("adds .package-name-redundant class to first h1 if it's similar to package.name", function() {
      var $ = marky(fixtures.wibble, {package: packages.wibble})
      assert.equal($("h1.package-name-redundant").length, 1)
    })

    it("leaves first h1 alone if it differs from package.name", function() {
      var $ = marky(fixtures.wibble, {package: packages.dangledor})
      assert.equal($("h1.package-name-redundant").length, 0)
      assert.equal($("h1:not(.package-name-redundant)").text(), "wibble.js")
    })
  })

  describe("description", function() {
    it("prepends package.description in a p.package-description element", function() {
      var $ = marky(fixtures.wibble, {package: packages.wibble})
      assert.equal(
        $("p.package-description").text(),
        packages.wibble.description
      )
    })

    it("adds .package-description-redundant class to first p if it's similar to package.description", function() {
      var $ = marky(fixtures.wibble, {package: packages.wibble})
      assert.equal($("p.package-description-redundant").length, 1)
    })

    it("leaves first p alone if it differs from package.description", function() {
      var $ = marky(fixtures.wibble, {package: packages.dangledor})
      assert.equal($("p.package-description-redundant").length, 0)
      assert.equal($("p:not(.package-description-redundant)").text(), "wibble.js")
    })
  })

})
