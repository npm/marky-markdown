#!/usr/bin/env node

var fs = require("fs")
var path = require("path")
var marky = require("..")
var pretty = require('pretty')
var beautify_html = require('js-beautify').html
var beautify_opts = {
  indent_size: 2,
  indent_char: " ",
  preserve_newlines: true
}

if (process.argv.length < 3) {
  console.log("Usage:\n\nmarky-markdown some.md > some.html")
  return
}

var filePath = path.resolve(process.cwd(), process.argv[2])

fs.readFile(filePath, function (err, data) {
  if (err) throw err;
  var $ = marky(data.toString())
  if ($ instanceof Error) throw $;
  process.stdout.write(pretty($.html()))
});
