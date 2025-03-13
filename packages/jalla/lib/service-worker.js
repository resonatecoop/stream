var path = require('path')
var brfs = require('brfs')
var tfilter = require('tfilter')
var tinyify = require('tinyify')
var through = require('through2')
var watchify = require('watchify')
var concat = require('concat-stream')
var browserify = require('browserify')
var sourcemap = require('convert-source-map')
var envify = require('@goto-bus-stop/envify')
var inject = require('./inject')

module.exports = serviceWorker

function serviceWorker (state, emit) {
  var cache = {}
  var basedir = path.dirname(state.sw)
  var id = path.relative(basedir, state.sw)
  var env = Object.assign(getEnv(), process.env)

  var b = browserify(state.sw, {
    debug: true,
    cache: cache,
    fullPaths: false,
    packageCache: {}
  })

  capture()
  b.on('reset', capture)

  // run envify regardless due to tinyify loosing the reference to env
  b.transform(tfilter(envify, { filter: include }), env)
  b.transform(tfilter(brfs, { filter: include }))

  if (state.env === 'development') {
    b.transform(inject('source-map-support/register', state.sw))
  } else {
    b.plugin(tinyify, { env })
  }

  if (state.watch) {
    b = watchify(b)
    b.on('update', function (bundle, rows) {
      emit('update', rows)
    })
    b.on('pending', onreset)
  }

  b.on('reset', onreset)
  return function (cb) {
    emit('progress', id, 0)
    var stream = b.bundle()
    stream.on('error', cb)
    stream.pipe(concat({ encoding: 'buffer' }, function (buff) {
      onbundle(buff)
      cb()
    }))
  }

  // test if file should be included in transform
  // str -> bool
  function include (file) {
    return !state.skip(file)
  }

  // emit progress on pipeline reset/pending
  // () -> void
  function onreset () {
    emit('reset')
  }

  // capture bundle dependencies from pipeline
  // () -> void
  function capture () {
    emit('reset')
    b.pipeline.get('deps').push(through.obj(function (row, enc, next) {
      var file = row.expose ? b._expose[row.id] : row.file
      emit('dep', file)
      this.push(row)
      next()
    }))
  }

  // emit bundled asset
  // (Buffer, str) -> void
  function onbundle (bundle) {
    if (state.env === 'development') {
      emit('asset', id, bundle, {
        static: true,
        mime: 'application/javascript'
      })
    } else {
      const src = bundle.toString()
      const map = sourcemap.fromSource(src)
      const buff = Buffer.from(sourcemap.removeComments(src))
      emit('asset', id, buff, {
        static: true,
        mime: 'application/javascript',
        map: Buffer.from(map.toJSON())
      })
    }
  }

  // compose env vars for bundle
  // App -> obj
  function getEnv () {
    var env = { NODE_ENV: state.env }
    env.ASSET_LIST = []
    for (const [key, asset] of state.assets) {
      if (key !== id) env.ASSET_LIST.push(asset.url)
    }
    return env
  }
}
