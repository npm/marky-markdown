#!/usr/bin/env node
var fs = require('fs')
var path = require('path')
var marky = require('..')
var yargs = require('yargs')
var omit = require('lodash').omit

var argv = yargs
  .usage([
  'npm\'s markdown parser',
  '',
  'Usage: $0 [options] some.md > some.html'
  ].join('\n'))
  .version(function () {
    return require('../package.json').version
  })
  .example(
    '$0 --no-sanitize some.md > some.html',
    'Parse "some.md" without sanitizing and redirect result to "some.html"'
  )
  .example(
      '$0 --no-highlight README.md > index.html',
      'Parse "README.md" without highlighting fenced code blocks and redirect result to "index.html"'
  )
  .option('sanitize', {
    default: true,
    describe: 'remove script tags and stuff',
    type: 'boolean'
  })
  .option('linkify', {
    default: true,
    describe: 'turn orphan URLs into hyperlinks',
    type: 'boolean'
  })
  .option('highlightSyntax', {
    alias: 'highlight',
    default: true,
    describe: 'run highlights on fenced code blocks',
    type: 'boolean'
  })
  .option('prefixHeadingIds', {
    alias: 'prefix',
    default: true,
    describe: 'prevent DOM id collisions',
    type: 'boolean'
  })
  .option('serveImagesWithCDN', {
    alias: 'cdn',
    default: false,
    describe: 'use npm\'s CDN to proxy images over HTTPS',
    type: 'boolean'
  })
  .demand(1)
  .wrap(Math.min(125, yargs.terminalWidth()))
  .argv


var options = omit(argv, ['_', 'version', 'highlight', 'prefix', 'cdn', '$0']);

var filePath = path.resolve(process.cwd(), argv._[0])

fs.readFile(filePath, function (err, data) {
  if (err) throw err
  var $ = marky(data.toString(), options)
  process.stdout.write($.html())
})
