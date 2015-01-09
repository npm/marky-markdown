var fs = require("fs")
var path = require("path")
var fixtures = module.exports = {}

fs.readdirSync(__dirname + "/fixtures").forEach(function(file) {
  var key = path.basename(file).replace(".md", "")
  fixtures[key] = fs.readFileSync(__dirname + "/fixtures/" + file).toString()
});

"async express johnny-five".split(" ").forEach(function(pkg) {
  fixtures[pkg] = fs.readFileSync(__dirname + "/../node_modules/" + pkg + "/README.md", "utf-8")
})
