module.exports = function (grammars, ttl, ongc) {
  var appliedTraps = []
  trap()

  function trap () {
    if (appliedTraps.length >= grammars.length) return

    for (var i = appliedTraps.length - 1;i < grammars.length;++i) {
      if (grammars[i]) {
        _trap(grammars[i], 'repository', i)
        appliedTraps[i] = true
      }
    }
  }

  function _trap (obj, key, name) {
    var started
    var timer
    var theValue = null

    Object.defineProperty(obj, key, {
      enumerable: true,
      get: function () {
        gcTimer()
        return theValue
      },
      set: function (v) {
        gcTimer()
        theValue = v
        return theValue
      }
    })

    function gcTimer () {
      if (!started) started = Date.now()

      clearTimeout(timer)
      timer = setTimeout(function () {
        // also clear out initalRule.
        // this is the same as grammar.clearRules()
        obj.initialRule = null
        theValue = null

        var timeLived = Date.now() - started
        started = 0

        if (ongc) ongc(name, timeLived)
        trap() // make sure i apply gc traps to later additions
      }, ttl)

      timer.unref()

      return started
    }
  }

}
