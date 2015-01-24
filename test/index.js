var assert = require("assert")
var fs = require("fs")
var path = require("path")
var fixtures = require("./fixtures.js")
var marky = require("..")

describe("marky-markdown", function() {

  it("is a function", function(){
    assert(marky)
    assert(typeof marky === "function")
  })

  it("accepts a markdown string and returns a cheerio DOM object", function(done){
     marky("hello, world", function(err, $) {
      assert($.html)
      assert($._root)
      assert($._options)
      assert(~$.html().indexOf("<p>hello, world</p>\n"))
      done()
    })
  })

  it("calls back with an error if first argument is not a string", function(done){
    marky(null, function(err, $) {
      assert(err)
      assert.equal(err.message, "first argument must be a string")
      marky([1,2,3], function(err, $) {
        assert(err)
        assert.equal(err.message, "first argument must be a string")
        marky({a:1}, function(err, $) {
          assert(err)
          assert.equal(err.message, "first argument must be a string")
          done()
        })
      })
    })
  })

})

describe("markdown processing and syntax highlighting", function() {
  var $
  before(function(done) {
    marky(fixtures.basic, {highlightSyntax: true}, function(err, output) {
      $ = output
      done()
    })
  })

  it('preserves query parameters in URLs when making them into links', function () {
    assert(~fixtures.basic.indexOf("watch?v=dQw4w9WgXcQ"))
    assert.equal($("a[href*='youtube.com']").attr('href'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  });

  it("converts github flavored fencing to code blocks", function() {
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

  it("adds sh class to shell blocks", function(){
    assert(fixtures.basic.indexOf("```coffee"))
    assert($("code.coffeescript").length)
  })

  it("adds hightlight class to all blocks", function() {
    assert.equal($("code").length, $("code.highlight").length)
  })

  it("applies inline syntax highlighting classes to javascript", function(){
    assert($("code.js span.kd").length)
    assert($("code.js span.nx").length)
    assert($("code.js span.p").length)
  })

  it("applies inline syntax highlighting classes to shell", function(){
    assert($("code.sh span.nb").length)
  })

  it("applies inline syntax highlighting classes to coffeesript", function(){
    assert($("code.coffeescript span.nx").length)
    assert($("code.coffeescript span.s").length)
  })

})

describe("sanitize", function(){
  var $

  before(function(done) {
    marky(fixtures.dirty, function(err, output) {
      $ = output
      done()
    })
  })

  it("removes script tags", function(){
    assert(~fixtures.dirty.indexOf("<script"))
    assert(!$("script").length)
  })

  it("optionally allows script tags", function(done){
    assert(~fixtures.dirty.indexOf("<script"))
    marky(fixtures.dirty, {allowScriptTags: true}, function(err, $){
      console.log($("script"))
      assert.equal($("script").length, 1)
      assert.equal($("script[src='http://malware.com']").length, 1)
      assert.equal($("script[type='text/javascript']").length, 1)
      assert.equal($("script[charset='utf-8']").length, 1)
      done()
    })
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
    assert($("code.highlight").length)
  })

  it("disallows iframes from sources other than youtube", function(done) {
    marky(fixtures.basic, function(err, $){
      assert(~fixtures.basic.indexOf("<iframe src=\"//www.youtube.com/embed/3I78ELjTzlQ"))
      assert(~fixtures.basic.indexOf("<iframe src=\"//malware.com"))
      assert.equal($("iframe").length, 1)
      assert.equal($("iframe").attr("src"), "//www.youtube.com/embed/3I78ELjTzlQ")
      done()
    })
  })

})

describe("badges", function(){
  var $

  before(function(done) {
    marky(fixtures.badges, function(err, output) {
      $ = output
      done()
    })
  })

  it("adds a badge class to img tags containing badge images", function() {
    assert($("img").length)
    assert.equal($("img").length, $("img.badge").length)
  })

  it("adds a badge-only class to p tags containing nothing more than a badge", function() {
    assert.equal($("p:not(.badge-only)").length, 2)
    assert.equal($("p.badge-only").length, $("p").length-2)
  })

})

describe("gravatar", function(){
  var $
  var images

  before(function(done) {
    marky(fixtures.gravatar, function(err, output){
      $ = output
      images = $("img")
      done()
    })
  })

  it("replaces insecure gravatar img src URLs with secure HTTPS URLs", function() {
    assert(~fixtures.gravatar.indexOf("http://gravatar.com/avatar/123?s=50&d=retro"))
    assert.equal(images.length, 3)
    assert.equal($(images[0]).attr('src'), "https://secure.gravatar.com/avatar/123?s=50&d=retro")
  })

  it("leaves secure gravatar URLs untouched", function() {
    assert(~fixtures.gravatar.indexOf("https://secure.gravatar.com/avatar/456?s=50&d=retro"))
    assert.equal($(images[1]).attr('src'), "https://secure.gravatar.com/avatar/456?s=50&d=retro")
  })

  it("leaves non-gravtar URLs untouched", function() {
    assert(~fixtures.gravatar.indexOf("http://not-gravatar.com/foo"))
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

    before(function(done) {
      marky(fixtures.github, {package: package}, function(err, output){
        $ = output
        done()
      })
    })

    it("rewrites relative link hrefs to absolute", function() {
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

    it("replaces relative img URLs with npm CDN URLs", function() {
      assert(~fixtures.github.indexOf("![](relative.png)"))
      assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/master/relative.png']").length)
    })

    it("replaces slashy relative img URLs with npm CDN URLs", function() {
      assert(~fixtures.github.indexOf("![](/slashy/deep.png)"))
      assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/master/slashy/deep.png']").length)
    })

    it("leaves protocol relative URLs alone", function() {
      assert(~fixtures.github.indexOf("![](//protocollie.com/woof.png)"))
      assert($("img[src='//protocollie.com/woof.png']").length)
    })

    it("leaves HTTPS URLs alone", function() {
      assert(~fixtures.github.indexOf("![](https://secure.com/good.png)"))
      assert($("img[src='https://secure.com/good.png']").length)
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

    before(function(done) {
      marky(fixtures.github, {package: package}, function(err, output){
        $ = output
        done()
      })
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

    it("leaves relative img alone", function() {
      assert(~fixtures.github.indexOf("![](relative.png)"))
      assert($("img[src='relative.png']").length)
    })

    it("leaves slashy relative img URLs alone", function() {
      assert(~fixtures.github.indexOf("![](/slashy/deep.png)"))
      assert($("img[src='/slashy/deep.png']").length)
    })

    it("leaves protocol relative URLs alone", function() {
      assert(~fixtures.github.indexOf("![](//protocollie.com/woof.png)"))
      assert($("img[src='//protocollie.com/woof.png']").length)
    })

    it("leaves HTTPS URLs alone", function() {
      assert(~fixtures.github.indexOf("![](https://secure.com/good.png)"))
      assert($("img[src='https://secure.com/good.png']").length)
    })


  })

})

describe("youtube", function() {
  var $
  var iframe

  before(function(done){
    marky(fixtures.basic, function(err, output){
      $ = output
      iframe = $(".youtube-video > iframe")
      done()
    })
  })

  it("wraps iframes in a div for stylability", function() {
    assert(!~fixtures.basic.indexOf("youtube-video"))
    assert.equal(iframe.length, 1)
  })

  it("removes iframe width and height properties", function() {
    assert.equal(iframe.attr("width"), null)
    assert.equal(iframe.attr("height"), null)
  })

  it("preserves src, frameborder, and allowfullscreen properties", function() {
    assert.equal(iframe.attr("src"), "//www.youtube.com/embed/3I78ELjTzlQ")
    assert.equal(iframe.attr("frameborder"), "0")
    assert.equal(iframe.attr("allowfullscreen"), "")
  })

})

describe("packagize", function() {

  var packages = {
    wibble: {
      name: "wibble",
      description: "A package called wibble"
    },
    wobble: {
      name: "wobble",
      description: "wibble"
    },
    dangledor: {
      name: "dangledor",
      description: "dangledor need not roar"
    }
  }

  describe("name", function() {

    it("prepends an h1.package-name element into readme with value of package.name", function(done){
      marky(fixtures.wibble, {package: packages.wibble}, function(err, $){
        assert.equal(
          $("h1.package-name").text(),
          packages.wibble.name
        )
        done()
      })
    })

    it("adds .package-name-redundant class to first h1 if it's similar to package.name", function(done) {
      marky(fixtures.wibble, {package: packages.wibble}, function(err, $){
        assert.equal($("h1.package-name-redundant").length, 1)
        done()
      })

    })

    it("leaves first h1 alone if it differs from package.name", function(done) {
      marky(fixtures.wibble, {package: packages.dangledor}, function(err, $){
        assert.equal($("h1.package-name-redundant").length, 0)
        assert.equal($("h1:not(.package-name)").text(), "wibble.js")
        done()
      })
    })
  })

  describe("description", function() {
    it("prepends package.description in a p.package-description element", function(done) {
      marky(fixtures.wibble, {package: packages.wibble}, function(err, $){
        assert.equal(
          $("p.package-description").text(),
          packages.wibble.description
        )
        done()
      })
    })

    it("adds .package-description-redundant class to first h1 if it's similar to package.description", function(done) {
      marky(fixtures.wibble, {package: packages.wobble}, function(err, $){
        assert.equal($("h1.package-description-redundant").length, 1)
        done()
      })
    })

    it("leaves first h1 alone if it differs from package.description", function(done) {
      marky(fixtures.wibble, {package: packages.dangledor}, function(err, $){
        assert.equal($("h1.package-description-redundant").length, 0)
        assert.equal($("h1:not(.package-name)").text(), "wibble.js")
        done()
      })
    })

    it("adds .package-description-redundant class to first p if it's similar to package.description", function(done) {
      marky(fixtures.wibble, {package: packages.wibble}, function(err, $){
        assert.equal($("p.package-description-redundant").length, 1)
        done()
      })
    })

    it("leaves first p alone if it differs from package.description", function(done) {
      marky(fixtures.wibble, {package: packages.dangledor}, function(err, $){
        assert.equal($("p.package-description-redundant").length, 0)
        assert.equal($("p:not(.package-description)").first().text(), "A package called wibble!")
        done()
      })
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

  it("includes some real package readmes right from node_modules", function(){
    assert(fixtures.async.length)
    assert(fixtures.express.length)
    assert(fixtures["johnny-five"].length)
  })

})

describe("headings", function(){
  var $

  before(function(done){
    marky(fixtures.dirty, function(err, output){
      $ = output
      done()
    })
  })

  it("injects hashy anchor tags into headings that have DOM ids", function(){
    assert(~fixtures.dirty.indexOf("# h1"))
    assert($("h1 a[href='#h1']").length)
  })

  it("adds deep-link class to modified headings", function(){
    assert(~fixtures.dirty.indexOf("# h1"))
    assert($("h1.deep-link a[href='#h1']").length)
  })

  it("doesn't inject anchor tags into headings that already contain anchors", function(){
    assert(~fixtures.dirty.indexOf("### [h3](/already/linky)"))
    assert($("h3 a[href='/already/linky']").length)
  })

})

describe("frontmatter", function() {
  it("rewrites HTML frontmatter as <meta> tags", function(done) {
    marky(fixtures.frontmatter, function(err, $){
      assert($("meta[name='hello']").length)
      assert.equal($("meta[name='hello']").attr("content"), "world")
      done()
    })
  })
})


describe("cdn", function() {

  describe("when serveImagesWithCDN is true", function() {
    var $
    var options = {
      package: {name: "foo", version: "1.0.0"},
      serveImagesWithCDN: true
    }

    before(function(done){
      marky(fixtures.basic, options, function(err, output){
        $ = output
        done()
      })
    })

    it("replaces relative img URLs with npm CDN URLs", function() {
      assert(~fixtures.basic.indexOf("![](relative.png)"))
      assert($("img[src='https://cdn.npm.im/foo@1.0.0/relative.png']").length)
    })

    it("replaces slashy relative img URLs with npm CDN URLs", function() {
      assert(~fixtures.basic.indexOf("![](/slashy/deep.png)"))
      assert($("img[src='https://cdn.npm.im/foo@1.0.0/slashy/deep.png']").length)
    })

    it("leaves protocol relative URLs alone", function() {
      assert(~fixtures.basic.indexOf("![](//protocollie.com/woof.png)"))
      assert($("img[src='//protocollie.com/woof.png']").length)
    })

    it("leaves HTTPS URLs alone", function() {
      assert(~fixtures.basic.indexOf("![](https://secure.com/good.png)"))
      assert($("img[src='https://secure.com/good.png']").length)
    })

  })


  describe("when serveImagesWithCDN is false (default)", function() {
    var $
    var options = {
      package: {
        name: "foo",
        version: "1.0.0"
      }
    }

    before(function(done){
      marky(fixtures.basic, options, function(err, output){
        $ = output
        done()
      })
    })

    it("leaves relative img alone", function() {
      assert(~fixtures.basic.indexOf("![](relative.png)"))
      assert($("img[src='relative.png']").length)
    })

    it("leaves slashy relative img URLs alone", function() {
      assert(~fixtures.basic.indexOf("![](/slashy/deep.png)"))
      assert($("img[src='/slashy/deep.png']").length)
    })

    it("leaves protocol relative URLs alone", function() {
      assert(~fixtures.basic.indexOf("![](//protocollie.com/woof.png)"))
      assert($("img[src='//protocollie.com/woof.png']").length)
    })

    it("leaves HTTPS URLs alone", function() {
      assert(~fixtures.basic.indexOf("![](https://secure.com/good.png)"))
      assert($("img[src='https://secure.com/good.png']").length)
    })

  })

})


describe("real readmes in the wild", function() {
  describe("express", function() {
    var $
    var package = require("../node_modules/express/package.json")

    beforeEach(function(done) {
      marky(fixtures.express, {package: package}, function(err, output){
        $ = output
        done()
      })
    })

    it("successfully parses readme.md", function(){
      assert($.html().length)
    })

    it("adds package name h1", function(){
      assert.equal($("h1.package-name a[href='#readme']").text(), "express")
    })

    it("identifies and marks redundant package description, even when it is not the the first paragraph", function(){
      assert($("p.package-description-redundant").length)
    })

  })


  describe("benchmark", function() {
    var $
    var package = require("../node_modules/benchmark/package.json")

    beforeEach(function(done) {
      marky(fixtures.benchmark, {package: package}, function(err, output){
        $ = output
        done()
      })
    })

    it("successfully parses", function(){
      assert($.html().length)
    })

    it("linkifies headings", function(){
      var link = $("h2#-benchmark-support-.deep-link a")
      assert.equal(link.attr('href'), "#-benchmark-support-")
      assert.equal(link.text(), "Benchmark.support")
    })

  })

  describe("async", function() {
    this.timeout(10000)
    var $
    var package = require("../node_modules/async/package.json")

    beforeEach(function(done) {
      marky(fixtures.async, {package: package, debug: false}, function(err, output){
        $ = output
        done()
      })
    })

    it("successfully parses", function(){
      assert($.html().length)
    })

  })

  describe("johnny-five", function() {
    var $
    var package = require("../node_modules/johnny-five/package.json")

    beforeEach(function(done) {
      marky(fixtures["johnny-five"], {package: package}, function(err, result){
        $ = result
        done()
      })
    })

    it("successfully parses", function(){
      assert($.html().length)
    })

    it("throws out HTML comments", function(){
      assert(fixtures["johnny-five"].match("<!--"))
      assert(!$.html().match("<!--"))
      assert(!$.html().match("&lt;!--"))
    })

  })

  describe("wzrd", function() {
    var $
    var package = require("../node_modules/wzrd/package.json")

    beforeEach(function(done) {
      marky(fixtures.wzrd, {package: package}, function(err, result){
        $ = result
        done()
      })
    })

    it("successfully parses", function(){
      assert($.html().length)
    })

    it("processes package description as markdown", function(){
      assert(package.description.match(/Inspired by \[beefy\]/))
      assert($("p.package-description a[href='http://npmjs.org/beefy']").length)
    })

  })


  describe("memoize", function() {
    var $
    var package = require("../node_modules/memoize/package.json")

    beforeEach(function(done) {
      marky(fixtures.memoize, {package: package}, function(err, result){
        $ = result
        done()
      })
    })

    it("successfully parses", function(){
      assert($.html().length)
    })

  })

  describe("mkhere", function() {
    var $
    var package = require("../node_modules/mkhere/package.json")

    beforeEach(function(done) {
      marky(fixtures.mkhere, {package: package}, function(err, result){
        $ = result
        done()
      })
    })

    it("successfully parses", function(){
      assert($.html().length)
    })

  })

  describe("cicada", function() {
    var $
    var package = require("../node_modules/cicada/package.json")

    beforeEach(function(done) {
      marky(fixtures.cicada, {package: package}, function(err, result){
        $ = result
        done()
      })
    })

    it("successfully parses", function(){
      assert($.html().length)
    })

  })

  describe("flake", function() {
    var $
    var package = require("../node_modules/flake/package.json")

    beforeEach(function(done) {
      marky(fixtures.flake, {package: package}, function(err, result){
        $ = result
        done()
      })
    })

    it("successfully parses", function(){
      assert($.html().length)
    })

  })

  describe("grunt-angular-templates", function() {
    var $
    var package = require("../node_modules/grunt-angular-templates/package.json")

    beforeEach(function(done) {
      marky(fixtures["grunt-angular-templates"], {package: package}, function(err, result){
        $ = result
        done()
      })
    })

    it("successfully parses", function(){
      assert($.html().length)
    })

  })

})
