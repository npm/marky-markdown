memoize
=======
memoize caches your callbacks given a set of arguments

Installation
------------
    npm install memoize

Usage
-----
```javascript
memoize(<object or function to memoize>, [expire time in ms], [array of methods to memoize], [options object])
```

Arguments after the 1st one can be passed in any order.

Available options (defaults shown):

```javascript
{
  expire  : 30000,  // Expire time in ms (false to never expire)
  exclude : [],     // Array of methods to exclude from memoizing
  only    : [],     // Array of methods to memoize only
  error   : true,   // If false, ignore errors and memoize anyway. Useful if your function doesn't callback an error
  debug   : false,  // Debugging
  store   : new MemoryStore()   // Storage engine to use - required methods: get, set, clear
}
```

You can set global options using `memoize.set(key, value)` or `memoize.set(options object)`.
If you wish to retrieve a value use `memoize.get(key)`

To force expiration of all stored memoized values: `memoize.clear(memoized object)`

Examples
--------

```javascript
var memoize = require('memoize')

var date = memoize(function(seed, cb) {
  setTimeout(function() {
    cb(null, Date.now())
  }, 100)
})

date(1, function(err, d1) { // given a set of arguments
  console.log(d1) // 1304606051552
  date(1, function(err, d2) { // same arguments
    console.log(d2) // 1304606051552  cached! same results
    date(2, function(err, d3) { // we changed the arguments
      console.log(d3) // 1304606051652  so it's different
    })
  })
})
```

also entire objects:

```javascript
var memoize = require('memoize')
  , redis = memoize('myobject', require('redis').createClient(), { exclude: [ 'set' ] })

redis.set('foo', 'bar', function(err) {
  redis.get('foo', function(err, res) {
    console.log(res) // 'bar'
    redis.set('foo', 'zoo', function(err) {
      redis.get('foo', function(err, res) {
        console.log(res) // still 'bar', hasn't expired yet!
      })
    })
  })
})
```

Todo
----
Better tests