/* globals before, describe, it */

var assert = require('assert')
var path = require('path')
var fixtures = require('./fixtures.js')
var marky = require('..')

describe('marky-markdown', function () {
  it('is a function', function () {
    assert(marky)
    assert(typeof marky === 'function')
  })

  it('accepts a markdown string and returns a cheerio DOM object', function () {
    var $ = marky('hello, world')
    assert($.html)
    assert($._root)
    assert($._options)
    assert(~$.html().indexOf('<p>hello, world</p>\n'))
  })

  it('throws an error if first argument is not a string', function () {
    assert.throws(
      function () { marky(null) },
      /first argument must be a string/
    )
  })

})

describe('markdown processing and syntax highlighting', function () {
  var $
  before(function () {
    $ = marky(fixtures.basic, {highlightSyntax: true})
  })

  it('preserves query parameters in URLs when making them into links', function () {
    assert(~fixtures.basic.indexOf('watch?v=dQw4w9WgXcQ'))
    assert.equal($("a[href*='youtube.com']").attr('href'), 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')
  })

  it('converts github flavored fencing to code blocks', function () {
    assert(~fixtures.basic.indexOf('```js'))
    assert($('code').length)
  })

  it('adds js class to javascript blocks', function () {
    assert(~fixtures.basic.indexOf('```js'))
    assert($('code.js').length)
  })

  it('adds sh class to shell blocks', function () {
    assert(~fixtures.basic.indexOf('```sh'))
    assert($('code.sh').length)
  })

  it('adds sh class to shell blocks', function () {
    assert(~fixtures.basic.indexOf('```coffee'))
    assert($('code.coffeescript').length)
  })

  it('adds hightlight class to all blocks', function () {
    assert.equal($('code').length, $('code.highlight').length)
  })

  it('applies inline syntax highlighting classes to javascript', function () {
    assert($('.js.modifier').length)
    assert($('.js.function').length)
  })

  it('applies inline syntax highlighting classes to shell', function () {
    assert($('.shell.builtin').length)
  })

  it('applies inline syntax highlighting classes to coffeesript', function () {
    assert($('.coffee.begin').length)
  })

  it('does not encode entities within code blocks', function () {
    assert(~fixtures.enterprise.indexOf('"name": "@myco/anypackage"'))
    var $ = marky(fixtures.enterprise)
    assert(!~$.html().indexOf('<span>quot</span>'))
    assert(~$.html().indexOf('<span>&quot;</span>'))
  })
})

describe('sanitize', function () {
  var $

  before(function () {
    $ = marky(fixtures.dirty)
  })

  it('removes script tags', function () {
    assert(~fixtures.dirty.indexOf('<script'))
    assert(!$('script').length)
  })

  it('can be disabled to allow input from trusted sources', function () {
    assert(~fixtures.dirty.indexOf('<script'))
    var $ = marky(fixtures.dirty, {sanitize: false})
    assert.equal($('script').length, 1)
    assert.equal($("script[src='http://malware.com']").length, 1)
    assert.equal($("script[type='text/javascript']").length, 1)
    assert.equal($("script[charset='utf-8']").length, 1)
  })

  it('allows img tags', function () {
    assert($('img').length)
    assert.equal($('img').attr('width'), "600")
    assert.equal($('img').attr('height'), "400")
    assert.equal($('img').attr('valign'), "middle")
    assert.equal($('img').attr('onclick'), undefined)
  })

  it('allows h1/h2/h3/h4/h5/h6 tags to preserve their dom id', function () {
    assert($('h1').attr('id'))
    assert($('h2').attr('id'))
    assert(!$('h3').attr('id'))
    assert($('h4').attr('id'))
    assert($('h5').attr('id'))
    assert($('h6').attr('id'))
  })

  it('removes classnames from elements', function () {
    assert(~fixtures.dirty.indexOf('class="xxx"'))
    assert(!$('.xxx').length)
  })

  it('allows classnames on code tags', function () {
    assert($('code.highlight').length)
  })

  it('disallows iframes from sources other than youtube', function () {
    var $ = marky(fixtures.basic)
    assert(~fixtures.basic.indexOf('<iframe src="//www.youtube.com/embed/3I78ELjTzlQ'))
    assert(~fixtures.basic.indexOf('<iframe src="//malware.com'))
    assert.equal($('iframe').length, 1)
    assert.equal($('iframe').attr('src'), '//www.youtube.com/embed/3I78ELjTzlQ')
  })

})

describe('badges', function () {
  var $

  before(function () {
    $ = marky(fixtures.badges)
  })

  it('adds a badge class to img tags containing badge images', function () {
    assert($('img').length)
    assert.equal($('img').length, $('img.badge').length)
  })

  it('adds a badge-only class to p tags containing nothing more than a badge', function () {
    assert.equal($('p:not(.badge-only)').length, 2)
    assert.equal($('p.badge-only').length, $('p').length - 2)
  })

})

describe('gravatar', function () {
  var $

  before(function () {
    $ = marky(fixtures.gravatar)
  })

  it('replaces insecure gravatar img src URLs with secure HTTPS URLs', function () {
    assert(~fixtures.gravatar.indexOf('http://gravatar.com/avatar/123?s=50&d=retro'))
    assert.equal($('img').length, 3)
    assert.equal($('img').eq(0).attr('src'), 'https://secure.gravatar.com/avatar/123?s=50&d=retro')
  })

  it('leaves secure gravatar URLs untouched', function () {
    assert(~fixtures.gravatar.indexOf('https://secure.gravatar.com/avatar/456?s=50&d=retro'))
    assert.equal($('img').eq(1).attr('src'), 'https://secure.gravatar.com/avatar/456?s=50&d=retro')
  })

  it('leaves non-gravtar URLs untouched', function () {
    assert(~fixtures.gravatar.indexOf('http://not-gravatar.com/foo'))
    assert.equal($('img').eq(2).attr('src'), 'http://not-gravatar.com/foo')
  })

})

describe('github', function () {
  describe('when package repo is on github', function () {
    var $
    var pkg = {
      name: 'wahlberg',
      repository: {
        type: 'git',
        url: 'https://github.com/mark/wahlberg'
      }
    }

    before(function () {
      $ = marky(fixtures.github, {package: pkg})
    })

    it('rewrites relative link hrefs to absolute', function () {
      assert(~fixtures.github.indexOf('(relative/file.js)'))
      assert($("a[href='https://github.com/mark/wahlberg/blob/master/relative/file.js']").length)
    })

    it('rewrites slashy relative links hrefs to absolute', function () {
      assert(~fixtures.github.indexOf('(/slashy/poo)'))
      assert($("a[href='https://github.com/mark/wahlberg/blob/master/slashy/poo']").length)
    })

    it('leaves protocol-relative URLs alone', function () {
      assert(~fixtures.github.indexOf('(//protocollie.com)'))
      assert($("a[href='//protocollie.com']").length)
    })

    it('leaves hashy URLs alone', function () {
      assert(~fixtures.github.indexOf('(#header)'))
      assert($("a[href='#header']").length)
    })

    it('replaces relative img URLs with npm CDN URLs', function () {
      assert(~fixtures.github.indexOf('![](relative.png)'))
      assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/master/relative.png']").length)
    })

    it('replaces slashy relative img URLs with npm CDN URLs', function () {
      assert(~fixtures.github.indexOf('![](/slashy/deep.png)'))
      assert($("img[src='https://raw.githubusercontent.com/mark/wahlberg/master/slashy/deep.png']").length)
    })

    it('leaves protocol relative URLs alone', function () {
      assert(~fixtures.github.indexOf('![](//protocollie.com/woof.png)'))
      assert($("img[src='//protocollie.com/woof.png']").length)
    })

    it('leaves HTTPS URLs alone', function () {
      assert(~fixtures.github.indexOf('![](https://secure.com/good.png)'))
      assert($("img[src='https://secure.com/good.png']").length)
    })

  })

  describe('when package repo is NOT on github', function () {
    var $
    var pkg = {
      name: 'bitbucketberg',
      repository: {
        type: 'git',
        url: 'https://bitbucket.com/mark/bitbucketberg'
      }
    }

    before(function () {
      $ = marky(fixtures.github, {package: pkg})
    })

    it('leaves relative URLs alone', function () {
      assert(~fixtures.github.indexOf('(relative/file.js)'))
      assert($("a[href='relative/file.js']").length)
    })

    it('leaves slashy relative URLs alone', function () {
      assert(~fixtures.github.indexOf('(/slashy/poo)'))
      assert($("a[href='/slashy/poo']").length)
    })

    it('leaves protocol-relative URLs alone', function () {
      assert(~fixtures.github.indexOf('(//protocollie.com)'))
      assert($("a[href='//protocollie.com']").length)
    })

    it('leaves hashy URLs alone', function () {
      assert(~fixtures.github.indexOf('(#header)'))
      assert($("a[href='#header']").length)
    })

    it('leaves relative img alone', function () {
      assert(~fixtures.github.indexOf('![](relative.png)'))
      assert($("img[src='relative.png']").length)
    })

    it('leaves slashy relative img URLs alone', function () {
      assert(~fixtures.github.indexOf('![](/slashy/deep.png)'))
      assert($("img[src='/slashy/deep.png']").length)
    })

    it('leaves protocol relative URLs alone', function () {
      assert(~fixtures.github.indexOf('![](//protocollie.com/woof.png)'))
      assert($("img[src='//protocollie.com/woof.png']").length)
    })

    it('leaves HTTPS URLs alone', function () {
      assert(~fixtures.github.indexOf('![](https://secure.com/good.png)'))
      assert($("img[src='https://secure.com/good.png']").length)
    })

  })

})

describe('youtube', function () {
  var $
  var iframe

  before(function () {
    $ = marky(fixtures.basic)
    iframe = $('.youtube-video > iframe')
  })

  it('wraps iframes in a div for stylability', function () {
    assert(!~fixtures.basic.indexOf('youtube-video'))
    assert.equal(iframe.length, 1)
  })

  it('removes iframe width and height properties', function () {
    assert.equal(iframe.attr('width'), null)
    assert.equal(iframe.attr('height'), null)
  })

  it('preserves src, frameborder, and allowfullscreen properties', function () {
    assert.equal(iframe.attr('src'), '//www.youtube.com/embed/3I78ELjTzlQ')
    assert.equal(iframe.attr('frameborder'), '0')
    assert.equal(iframe.attr('allowfullscreen'), '')
  })

})

describe('packagize', function () {
  var packages = {
    wibble: {
      name: 'wibble',
      description: 'A package called wibble'
    },
    wobble: {
      name: 'wobble',
      description: 'wibble'
    },
    dangledor: {
      name: 'dangledor',
      description: 'dangledor need not roar'
    }
  }

  describe('name', function () {
    it("adds .package-name-redundant class to first h1 if it's similar to package.name", function () {
      var $ = marky(fixtures.wibble, {package: packages.wibble})
      assert.equal($('h1.package-name-redundant').length, 1)
    })

    it('leaves first h1 alone if it differs from package.name', function () {
      var $ = marky(fixtures.wibble, {package: packages.dangledor})
      assert.equal($('h1.package-name-redundant').length, 0)
      assert.equal($('h1:not(.package-name)').text(), 'wibble.js')
    })
  })

  describe('description', function () {
    it("adds .package-description-redundant class to first h1 if it's similar to package.description", function () {
      var $ = marky(fixtures.wibble, {package: packages.wobble})
      assert.equal($('h1.package-description-redundant').length, 1)
    })

    it('leaves first h1 alone if it differs from package.description', function () {
      var $ = marky(fixtures.wibble, {package: packages.dangledor})
      assert.equal($('h1.package-description-redundant').length, 0)
      assert.equal($('h1:not(.package-name)').text(), 'wibble.js')
    })

    it("adds .package-description-redundant class to first p if it's similar to package.description", function () {
      var $ = marky(fixtures.wibble, {package: packages.wibble})
      assert.equal($('p.package-description-redundant').length, 1)
    })

    it('leaves first p alone if it differs from package.description', function () {
      var $ = marky(fixtures.wibble, {package: packages.dangledor})
      assert.equal($('p.package-description-redundant').length, 0)
      assert.equal($('p:not(.package-description)').first().text(), 'A package called wibble!')
    })
  })

  describe('parsePackageDescription()', function () {
    it('is a method for parsing package descriptions', function () {
      assert.equal(typeof marky.parsePackageDescription, 'function')
    })

    it('parses description as markdown and removes script tags', function () {
      var description = marky.parsePackageDescription('bad <script>/xss</script> [hax](http://hax.com)')
      assert.equal(description, 'bad  <a href="http://hax.com">hax</a>')
    })

    it('safely handles inline code blocks', function () {
      var description = marky.parsePackageDescription('Browser `<input type="text">` Helpers')
      assert.equal(description, 'Browser <code>&lt;input type=&quot;text&quot;&gt;</code> Helpers')
    })

    it('safely handles script tags in inline code blocks', function () {
      var description = marky.parsePackageDescription('Here comes a `<script>` tag')
      assert.equal(description, 'Here comes a <code>&lt;script&gt;</code> tag')
    })

  })

})

describe('fixtures', function () {
  it('is a key-value object', function () {
    assert(fixtures)
    assert(typeof fixtures === 'object')
    assert(!Array.isArray(fixtures))
  })

  it('contains stringified markdown files as values', function () {
    var keys = Object.keys(fixtures)
    assert(keys.length)
    keys.forEach(function (key) {
      assert(fixtures[key])
      if (key === 'packageNames') return
      assert(typeof fixtures[key] === 'string')
    })
  })

  it('has a property that is an alphabetical list of dependencies', function () {
    assert(Array.isArray(fixtures.packageNames))
    assert(fixtures.packageNames.length)
  })

  it('includes some real package readmes right from node_modules', function () {
    assert(fixtures.async.length)
    assert(fixtures.express.length)
    assert(fixtures['johnny-five'].length)
  })

})

describe('headings', function () {
  var $

  before(function () {
    $ = marky(fixtures.dirty)
  })

  it('injects hashy anchor tags into headings that have DOM ids', function () {
    assert(~fixtures.dirty.indexOf('# h1'))
    assert($("h1 a[href='#h1']").length)
  })

  it('adds deep-link class to modified headings', function () {
    assert(~fixtures.dirty.indexOf('# h1'))
    assert($("h1.deep-link a[href='#h1']").length)
  })

  it("doesn't inject anchor tags into headings that already contain anchors", function () {
    assert(~fixtures.dirty.indexOf('### [h3](/already/linky)'))
    assert($("h3 a[href='/already/linky']").length)
  })

  it('applies a prefix to generated DOM ids by default', function () {
    assert(~fixtures.dirty.indexOf('## h2'))
    assert.equal($('h2#user-content-h2').length, 1)
  })

  it('allows id prefixes to be disabled with prefixHeadingIds', function () {
    assert(~fixtures.dirty.indexOf('#### This is a TEST'))
    $ = marky(fixtures.dirty, {prefixHeadingIds: false})
    assert.equal($('h4#this-is-a-test').length, 1)
  })

  it('encodes innerHTML and removes angle brackets before generating ids', function () {
    assert(~fixtures.payform.indexOf('## Browser `<input>` Helpers'))
    $ = marky(fixtures.payform, {prefixHeadingIds: false})
    assert.equal($('h2#browser-input-helpers a').length, 1)
    assert.equal($('h2#browser-input-helpers a').html(), 'Browser <code>&lt;input&gt;</code> Helpers')
  })

})

describe('frontmatter', function () {
  it('rewrites HTML frontmatter as <meta> tags', function () {
    var $ = marky(fixtures.frontmatter)
    assert($("meta[name='hello']").length)
    assert.equal($("meta[name='hello']").attr('content'), 'world')
  })
})

describe('cdn', function () {
  describe('when serveImagesWithCDN is true', function () {
    var $
    var options = {
      package: {name: 'foo', version: '1.0.0'},
      serveImagesWithCDN: true
    }

    before(function () {
      $ = marky(fixtures.basic, options)
    })

    it('replaces relative img URLs with npm CDN URLs', function () {
      assert(~fixtures.basic.indexOf('![](relative.png)'))
      assert($("img[src='https://cdn.npm.im/foo@1.0.0/relative.png']").length)
    })

    it('replaces slashy relative img URLs with npm CDN URLs', function () {
      assert(~fixtures.basic.indexOf('![](/slashy/deep.png)'))
      assert($("img[src='https://cdn.npm.im/foo@1.0.0/slashy/deep.png']").length)
    })

    it('leaves protocol relative URLs alone', function () {
      assert(~fixtures.basic.indexOf('![](//protocollie.com/woof.png)'))
      assert($("img[src='//protocollie.com/woof.png']").length)
    })

    it('leaves HTTPS URLs alone', function () {
      assert(~fixtures.basic.indexOf('![](https://secure.com/good.png)'))
      assert($("img[src='https://secure.com/good.png']").length)
    })

  })

  describe('when serveImagesWithCDN is false (default)', function () {
    var $
    var options = {
      package: {
        name: 'foo',
        version: '1.0.0'
      }
    }

    before(function () {
      $ = marky(fixtures.basic, options)
    })

    it('leaves relative img alone', function () {
      assert(~fixtures.basic.indexOf('![](relative.png)'))
      assert($("img[src='relative.png']").length)
    })

    it('leaves slashy relative img URLs alone', function () {
      assert(~fixtures.basic.indexOf('![](/slashy/deep.png)'))
      assert($("img[src='/slashy/deep.png']").length)
    })

    it('leaves protocol relative URLs alone', function () {
      assert(~fixtures.basic.indexOf('![](//protocollie.com/woof.png)'))
      assert($("img[src='//protocollie.com/woof.png']").length)
    })

    it('leaves HTTPS URLs alone', function () {
      assert(~fixtures.basic.indexOf('![](https://secure.com/good.png)'))
      assert($("img[src='https://secure.com/good.png']").length)
    })

  })

})

describe('real readmes in the wild', function () {
  it('parses readmes of all dependencies and devDependencies', function (done) {
    var packages = fixtures.packageNames

    assert(Array.isArray(packages))
    assert(packages.length)
    packages.forEach(function (name) {
      console.log('\t' + name)
      assert(typeof fixtures[name] === 'string')
      var json = require(path.resolve('node_modules', name, 'package.json'))
      var $ = marky(fixtures[name], {package: json})
      assert($.html().length > 100)

      if (name === packages[packages.length - 1]) {
        return done()
      }
    })
  })

})
