var fs = require('fs')
var Koa = require('koa')
var path = require('path')
var assert = require('assert')
var browserslist = require('browserslist')
var ui = require('./ui')
var build = require('./build')
var style = require('./style')
var script = require('./script')
var assets = require('./assets')
var compile = require('./compile')
var manifest = require('./manifest')
var Pipeline = require('./pipeline')
var serviceWorker = require('./service-worker')

var DEFAULT_BROWSERS = [
  'last 2 Chrome versions',
  'last 2 Firefox versions',
  'last 2 Safari versions',
  'last 2 Edge versions',
  '> 1%'
]

module.exports = class App extends Koa {
  constructor (entry, opts) {
    super()

    var bundled = []
    if (opts.serve) {
      try {
        // pick up stat of existing build
        const stat = require(path.resolve(opts.dist, 'stat.json'))
        bundled = stat.assets.map(function (asset) {
          return Object.assign({}, asset, {
            hash: Buffer.from(asset.hash, 'hex'),
            file: path.resolve(opts.dist, 'public', asset.file)
          })
        })
        this.browsers = stat.browsers
      } catch (err) {
        this.emit('error', Error('Failed to load stat from serve directory'))
      }
    } else {
      const dir = path.dirname(entry)
      const browsers = browserslist.loadConfig({ path: dir, env: this.env })
      this.browsers = browsers || DEFAULT_BROWSERS
    }

    var pipeline = new Pipeline([
      ['scripts', script],
      ['styles', style],
      ['assets', assets],
      ['manifest', manifest],
      ['service-worker'],
      ['build']
    ], bundled)

    this.bundled = false
    this.base = opts.base || ''
    this.entry = entry
    this._opts = opts
    this.pipeline = pipeline
    this.context.assets = pipeline.assets

    if (opts.sw) {
      pipeline.get('service-worker').push(serviceWorker)
    }

    if (typeof opts.compile === 'undefined' || opts.compile) {
      pipeline.get('scripts').push(compile)
    }

    if (!opts.quiet) ui(this)
    else this.silent = true
  }

  get state () {
    return Object.assign({
      browsers: this.browsers,
      base: this.base,
      env: this.env,
      watch: this.env === 'development'
    }, this._opts)
  }

  // write assets to disk
  // (str, fn) -> void
  build (dir, state) {
    assert(typeof dir === 'string', 'jalla:build dir should be type string')

    if (!path.isAbsolute(dir)) dir = path.resolve(dir)

    state = Object.assign({}, this.state, state, { dist: dir, watch: false })

    return new Promise((resolve, reject) => {
      fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) return reject(err)
        var index = this.pipeline.get('build').push(build)
        this.pipeline.bundle(this.entry, state, (err) => {
          this.pipeline.get('build').splice(index, 1)
          if (err) return reject(err)
          resolve()
        })
      })
    })
  }

  bundle () {
    this.bundled = true
    var init = new Promise((resolve, reject) => {
      this.pipeline.bundle(this.entry, this.state, function (err) {
        if (err) return reject(err)
        resolve()
      })
    })
    this.middleware.unshift((ctx, next) => init.then(next))
    return init
  }

  listen (port = 8080, cb) {
    var self = this
    if (!this.state.serve && !this.bundled) this.bundle()
    return super.listen(port, function () {
      self.emit('start', port)
      if (typeof cb === 'function') return cb.apply(this, arguments)
    })
  }
}
