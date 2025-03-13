var path = require('path')
var assert = require('assert')
var serve = require('koa-static')
var { Minimatch } = require('minimatch')
var App = require('./lib/app')
var render = require('./lib/render')

module.exports = start

function start (entry, opts = {}) {
  assert(typeof entry === 'string', 'jalla: entry should be type string')
  entry = absolute(entry)

  var dir = path.dirname(entry)
  var dist = opts.dist
  if (!dist) dist = typeof opts.serve === 'string' ? opts.serve : 'dist'

  var swPath = opts.sw
    ? path.resolve(dir, dist, 'public', path.relative(dir, opts.sw))
    : null

  if (opts.skip) {
    const input = Array.isArray(opts.skip) ? opts.skip : [opts.skip]
    var skip = input.map(normalizeSkip)
  }

  opts = Object.assign({}, opts, {
    dist: absolute(dist, dir),
    serve: Boolean(opts.serve),
    sw: opts.sw && absolute(opts.sw, dir),
    css: opts.css && absolute(opts.css, dir),
    skip (file) {
      if (!skip) return false
      return skip.reduce((res, test) => res || test(file), false)
    }
  })

  var app = new App(entry, opts)

  app.use(async function (ctx, next) {
    var start = Date.now()
    await next()
    app.emit('timing', Date.now() - start, ctx)
  })

  app.use(require('koa-conditional-get')())
  app.use(require('koa-etag')())
  app.use(render(app))

  if (opts.serve) {
    app.use(serve(path.resolve(opts.dist, 'public'), { setHeaders }))
  } else {
    app.use(app.pipeline.middleware(app.state))
  }

  return app

  // set static asset headers
  // (obj, str, obj) -> void
  function setHeaders (res, filepath, stats) {
    if (filepath === swPath) {
      res.setHeader('Cache-Control', 'max-age=0')
    } else {
      res.setHeader('Cache-Control', `public, max-age=${60 * 60 * 24 * 365}`)
    }
  }
}

// ensure skip input is a function
// any -> fn
function normalizeSkip (val) {
  if (val instanceof RegExp) {
    return val.test.bind(val)
  } else if (typeof val === 'function') {
    return val
  } else if (typeof val === 'string') {
    var minimatch = new Minimatch(val)
    return function (str) {
      return str.includes(val) || minimatch.match(str)
    }
  } else {
    throw new Error('jalla: skip should be either RegExp, function or string')
  }
}

// resolve file path (relative to dir) to absolute path
// (str, str?) -> str
function absolute (file, dir = '') {
  if (path.isAbsolute(file)) return file
  return path.resolve(dir, file)
}
