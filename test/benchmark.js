var Benchmark = require('benchmark')
var marky = require('..')

var suite = new Benchmark.Suite

suite.add('marky-markdown#marky', function() {
  marky('fixtures/readmes/benchmark.md', 'benchmark')
}).on('cycle', function(event) {
  console.log(String(event.target))
}).run()
