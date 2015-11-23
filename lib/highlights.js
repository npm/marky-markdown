var cleanup = require('./cleanup')
var Highlights = require('highlights')
var once = require('once')

var languages = [
  'atom-language-nginx',
  'language-dart',
  'language-rust',
  'language-erlang',
  'language-glsl',
  'language-haxe',
  'language-ini',
  'language-stylus'
]

module.exports = function (cb) {
  var hl = new Highlights()

  cb = once(cb)

  hl._markycbs = [cb]

  function cbs (err) {
    hl._markyloaded = !err
    var _cbs = hl._markycbs
    delete hl._markycbs

    while (_cbs.length) _cbs.shift()(err, hl)
  }

  var todo = languages.length
  var done = function (err) {
    if (err) return cbs(err)
    if (--todo) return
    hl._markyloaded = true

    cleanup(hl.registry.grammars)

    cbs(false, hl)
  }

  languages.forEach(function (language) {
    hl.requireGrammars({
      modulePath: require.resolve(language + '/package.json')
    }, function (err) {
      done(err)
    })
  })

  return hl
}

module.exports.sync = function () {
  var hl = new Highlights()
  languages.forEach(function (language) {
    hl.requireGrammarsSync({
      modulePath: require.resolve(language + '/package.json')
    })
  })

  cleanup(hl.registry.grammars)

  hl._markyloaded = true
  return hl
}

module.exports.onReady = function (hl, cb) {
  if (!hl._markyloaded) return hl._markycbs.push(cb)
  setImmediate(cb)
}

module.exports.isReady = function (hl) {
  return hl._markyloaded
}
