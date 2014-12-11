var fs = require("fs")
var fixtures = module.exports = {}

fs.readdirSync(__dirname + "/fixtures").forEach(function(file) {
  var key = path.basename(file).replace(".md", "")
  fixtures[key] = fs.readFileSync(__dirname + "/fixtures/" + file).toString()
})
