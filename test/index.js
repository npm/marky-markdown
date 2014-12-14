var assert = require("assert")
var fixtures = require("./fixtures.js")
var marky = require("..")

describe("marky-markdown", function() {

  it("is a function", function(){
    assert(marky)
    assert(typeof marky === "function")
  })

  it("accepts a markdown string and returns a cheerio DOM object", function(){
    var $ = marky(fixtures.basic)
    assert($.html)
    assert($._root)
    assert($._options)
    assert(~$.html().indexOf("<h1 id=\"hello-world\">hello world</h1>\n<p>paragraph</p>\n"))
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


})

describe("syntax highlighting", function() {
  var $ = marky(fixtures.basic)

  it("converts github flavored markdown to <code> blocks", function() {
    assert(fixtures.basic.indexOf("```js"))
    assert($("code").length)
  })

  it("adds js class to javascript blocks", function(){
    assert(fixtures.basic.indexOf("```js"))
    assert($("code.js").length)
  })

  it("adds sh class to shell blocks", function(){
    assert(fixtures.basic.indexOf("```sh"))
    assert($("code.sh").length)
  })

  it("adds hljs class to all blocks", function() {
    assert.equal($("code").length, $("code.hljs").length)
  })

})

describe("sanitize", function(){
  var $

  before(function() {
    $ = marky(fixtures.dirty)
  })

  it("removes script tags", function(){
    assert(~fixtures.dirty.indexOf("<script"))
    assert(!$("script").length)
  })

  it("allows img tags", function() {
    assert($("img").length)
  })

  it("allows h1/h2/h3/h4/h5/h6 tags to preserve their dom id", function() {
    assert($("h1").attr("id"))
    assert($("h2").attr("id"))
    assert($("h3").attr("id"))
    assert($("h4").attr("id"))
    assert($("h5").attr("id"))
    assert($("h6").attr("id"))
  })

  it("removes classnames from elements", function() {
    assert(~fixtures.dirty.indexOf("class=\"xxx\""))
    assert(!$(".xxx").length)
  })

  it("allows classnames on code tags", function() {
    assert($("code.hljs").length)
  })

})

describe("badges", function(){

  it("adds a badges class to p tags containing badge images", function() {
    var $ = marky(fixtures.badges)
    assert($("p:has(img)").length)
    assert($("p:has(img[src*='nodei.co'])").length)
    assert($("p:has(img[src*='nodei.co'])").hasClass("badge"))
    assert.equal($("p").length, $("p.badge").length)
  })

  it("adds a badge-with-siblings class to p tags containing more than just a badge", function() {
    var $ = marky(fixtures.badges)
    assert.equal($("p.badge-with-siblings").length, 1)
    assert.equal($("p.badge-with-siblings").text(), "neighboring  content")
  })

})

describe("gravatar", function(){
  var $
  var images

  before(function() {
    $ = marky(fixtures.gravatar)
    images = $("img")
  })

  it("replaces insecure gravatar img src URLs with secure HTTPS URLs", function() {
    assert(~fixtures.gravatar.indexOf("http://gravatar.com/avatar/123?s=50&d=retro"))
    assert.equal(images.length, 3)
    assert.equal($(images[0]).attr('src'), "https://secure.gravatar.com/avatar/123?s=50&d=retro")
  })

  it("leaves secure gravatar URLs untouched", function() {
    assert(~fixtures.gravatar.indexOf("https://secure.gravatar.com/avatar/456?s=50&d=retro"))
    var $ = marky(fixtures.gravatar)
    assert.equal($(images[1]).attr('src'), "https://secure.gravatar.com/avatar/456?s=50&d=retro")
  })

  it("leaves non-gravtar URLs untouched", function() {
    assert(~fixtures.gravatar.indexOf("http://not-gravatar.com/foo"))
    var $ = marky(fixtures.gravatar)
    assert.equal($(images[2]).attr('src'), "http://not-gravatar.com/foo")
  })

})

describe("github", function(){

  describe("when package repo is on github", function() {
    var $
    var package = {
      name: "wahlberg",
      repository: {
        type: "git",
        url: "https://github.com/mark/wahlberg"
      }
    }

    before(function() {
      $ = marky(fixtures.github, {package: package})
    })

    it("rewrites relative links hrefs to absolute", function() {
      assert(~fixtures.github.indexOf("(relative/file.js)"))
      assert($("a[href='https://github.com/mark/wahlberg/blob/master/relative/file.js']").length)
    })

    it("rewrites slashy relative links hrefs to absolute", function() {
      assert(~fixtures.github.indexOf("(/slashy/poo)"))
      assert($("a[href='https://github.com/mark/wahlberg/blob/master/slashy/poo']").length)
    })

    it("leaves protocol-relative URLs alone", function() {
      assert(~fixtures.github.indexOf("(//protocollie.com)"))
      assert($("a[href='//protocollie.com']").length)
    })

    it("leaves hashy URLs alone", function() {
      assert(~fixtures.github.indexOf("(#header)"))
      assert($("a[href='#header']").length)
    })

  })

  describe("when package repo is NOT on github", function() {
    var $
    var package = {
      name: "bitbucketberg",
      repository: {
        type: "git",
        url: "https://bitbucket.com/mark/bitbucketberg"
      }
    }

    before(function() {
      $ = marky(fixtures.github, {package: package})
    })

    it("leaves relative URLs alone", function() {
      assert(~fixtures.github.indexOf("(relative/file.js)"))
      assert($("a[href='relative/file.js']").length)
    })

    it("leaves slashy relative URLs alone", function() {
      assert(~fixtures.github.indexOf("(/slashy/poo)"))
      assert($("a[href='/slashy/poo']").length)
    })

    it("leaves protocol-relative URLs alone", function() {
      assert(~fixtures.github.indexOf("(//protocollie.com)"))
      assert($("a[href='//protocollie.com']").length)
    })

    it("leaves hashy URLs alone", function() {
      assert(~fixtures.github.indexOf("(#header)"))
      assert($("a[href='#header']").length)
    })

  })

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
      assert.equal($("h1:not(.package-name)").text(), "wibble.js")
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
      assert.equal($("p:not(.package-description)").first().text(), "A package called wibble!")
    })
  })

})

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

describe("niceties", function(){
  it("supports deep linking by injecting <a> tags into headings that have DOM ids")
  it("replaces relative image URLs with npm CDN URLs")
  it("rewrites HTML frontmatter as <meta> tags")
})
