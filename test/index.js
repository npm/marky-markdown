var assert = require("assert")
var fs = require("fs")
var path = require("path")
var fixtures = {}
fs.readdirSync(__dirname + "/fixtures").forEach(function(file) {
  var key = path.basename(file).replace(".md", "")
  fixtures[key] = fs.readFileSync(__dirname + "/fixtures/" + file).toString()
})
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

  it("converts markdown to HTML", function(){
    var output = marky(fixtures.basic)
    assert.equal(basic, "<h1 id=\"hello-world\">hello world</h1>")
  })

  it("throws an error if first argument is not a string", function(){
    var errorPattern = new RegExp("first argument must be a string", "i")
    assert.throws(function() { marky(null) }, errorPattern)
    assert.throws(function() { marky([1,2,3]) }, errorPattern)
    assert.throws(function() { marky({a:1,b:2}) }, errorPattern)
  })

  it("replaces relative image URLs with npm CDN URLs")

  it("replaces insecure gravatar img src URLs with secure HTTPs URLs", function() {
    // Make sure the fixture contains an insecure URL first
    assert(fixtures.gravatar_insecure.match("http://gravatar.com/avatar/123?s=50&d=retro"))

    var html = marky(fixtures.gravatar_insecure)
    var $ = cheerio.load(html)
    var images = $("img")
    assert.equal(images.length, 2)
    assert.equal(images[0].attr('src'), "https://secure.gravatar.com/avatar/123?s=50&d=retro")
    assert.equal(images[1].attr('src'), "https://secure.gravatar.com/avatar/456?s=50&d=retro")
  })

  it("adds a 'badge' class to <p> tags containing badge images", function() {
    var html = marky(fixtures.badges)
    var $ = cheerio.load(html)
    var ps = $("p")
    assert($("p:has(img)").length)
    assert($("p:has(img[src*='nodei.co'])").length)
    assert($("p:has(img[src*='nodei.co'])").hasClass("badge"))
    assert.equal($("p"), $("p:has(img.badge)"))
  }

  describe("syntax highlighting", function() {

    it("converts GFM to <code> blocks")

    it("adds 'lang-js' class to javascript blocks")

    it("adds 'lang-sh' class to shell blocks")

    it("adds 'hljs' class to all blocks")
  }

  describe("options", function() {

    it("allows an options object as the second argument")

    describe("package", function() {

      describe("package.name", function() {
        it("prepends package.name in an <h1>")

        it("removes first <h1> if it's similar to package.name")

        it("leaves first <h1> if it differs from package.name")
      })

      describe("package.description", function() {
        it("prepends package.description in an <h2> with 'description' class")

        it("removes first <p> if it's similar to package.description")

        it("leaves first <p> if it differs from package.description")
      })

      describe("package.repository", function() {
        it("rewrites relative URLs to fully-qualified GitHub URLs is package.repository is on GitHub")
      })

    })

  })


  it("writes HTML frontmatter as <meta> tags")

  it("supports deep linking by injecting <a> tags into headings that have DOM ids")

})
