#!/usr/bin/env node
var fs = require('fs')
var path = require('path')
var marky = require('..')
var information = require('../marky.json')

var executable = process.argv[0]
var script = process.argv[1]
var parameters = process.argv.slice(2)

function printHelp () {
  console.log('Usage: marky-markdown [filename]')
  console.log('')
  console.log('Options: ')
  console.log(' -h, --help    show this help message')
  console.log(' -v, --version print the marky-markdown version')
  console.log('')
  console.log('Example:  `marky-markdown readme.md`')
}

function help () {
  if (parameters[0] === '-h' || parameters[0] === '--help') {
    printHelp()
    process.exit()
  }
}

function version () {
  if (parameters[0] === '-V' || parameters[0] === '--version') {
    console.log(information.version)
    process.exit()
  }
}

if (parameters.length === 0) {
  printHelp()
  process.exit()
}

help()
version()

var filename = path.resolve(process.cwd(), argv[0])

fs.readFile(filename, function (err, data) {
  if (err) throw err
  var html = marky(data.toString())
  process.stdout.write(html)
})
