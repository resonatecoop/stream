#!/usr/bin/env node

process.title = 'jalla'

var path = require('path')
var chalk = require('chalk')
var assert = require('assert')
var dedent = require('dedent')
var getPort = require('get-port')
var minimist = require('minimist')
var jalla = require('./index')

var COMMANDS = ['start', 'build', 'serve']

var argv = minimist(process.argv.slice(2), {
  alias: {
    'service-worker': 'sw',
    dir: 'd',
    quiet: 'q',
    inspect: 'i',
    skip: 's',
    base: 'b',
    watch: 'w',
    port: 'p',
    help: 'h',
    version: 'v'
  },
  default: {
    port: process.env.PORT || 8080
  },
  boolean: [
    'help',
    'quiet',
    'version'
  ]
})

if (argv.help) {
  console.log('\n', dedent`
    ${chalk.dim('usage')}
      ${chalk.cyan.bold('jalla')} [command] [opts] <entry>

    ${chalk.dim('commands')}
      start                   start server and compile assets (default)
      build                   build assets to disk
      serve                   start server and serve built assets

    ${chalk.dim('options')}
      --css                   entry point for CSS
      --service-worker, --sw  entry point for service worker
      --base, -b              base path where app will be mounted
      --skip, -s              skip transform for file/glob (excluding optimizations)
      --watch, -w             enable watch mode (default in development)
      --dir, -d               output directory, use with ${chalk.bold('build')} and ${chalk.bold('serve')}
      --quiet, -q             disable printing to console
      --inspect, -i           enable node inspector, accepts port
      --port, -p              server port
      --version, -v           print version
      --help, -h              show this help text

    ${chalk.dim('examples')}
      ${chalk.bold('start development server')}
      jalla index.js

      ${chalk.bold('start development server with CSS and service worker entries')}
      jalla index.js --sw sw.js --css index.css

      ${chalk.bold('build and start production server')}
      NODE_ENV=production jalla build index.js && jalla serve index.js
  `)
  process.exit(0)
}

if (argv.version) {
  console.log(require('./package.json').version)
  process.exit(0)
}

var entry = argv._[argv._.length - 1]
var command = argv._.length > 1 ? argv._[0] : 'start'
assert(COMMANDS.includes(command), `jalla: command "${command}" not recognized`)
assert(entry, 'jalla: entry file should be supplied')

if (argv.inspect) {
  if (typeof argv.inspect === 'number') process.debugPort = argv.inspect
  process.kill(process.pid, 'SIGUSR1')
}

var opts = {}
if (argv.css) opts.css = argv.css
if (argv.base) opts.base = argv.base
if (argv.quiet) opts.quiet = argv.quiet
if (command === 'serve') opts.serve = argv.dir || true
if (argv['service-worker']) opts.sw = argv['service-worker']
if (typeof argv.watch !== 'undefined') opts.watch = Boolean(argv.watch)

if (command === 'build') {
  opts.watch = false
  const app = jalla(path.resolve(process.cwd(), entry), opts)
  const dir = typeof argv.dir === 'string' ? argv.dir : 'dist'
  app.build(path.resolve(process.cwd(), dir)).then(function () {
    process.exit(0)
  }, function () {
    process.exit(1)
  })
} else {
  const app = jalla(path.resolve(process.cwd(), entry), opts)
  getPort({ port: argv.port || 8080 }).then(function (port) {
    app.listen(port)
  })
}
