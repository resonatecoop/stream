var path = require('path')
var brfs = require('brfs')
var tinyify = require('tinyify')
var tfilter = require('tfilter')
var through = require('through2')
var nanohtml = require('nanohtml')
var babelify = require('babelify')
var watchify = require('watchify')
var caniuse = require('caniuse-api')
var concat = require('concat-stream')
var browserify = require('browserify')
var splitRequire = require('split-require')
var sourcemap = require('convert-source-map')
var envify = require('@goto-bus-stop/envify')
var babelPresetEnv = require('@babel/preset-env')
var inject = require('./inject')

module.exports = script

function script (state, emit) {
  var b = browserify(state.entry, {
    cache: {},
    debug: true,
    fullPaths: false,
    packageCache: {}
  })

  capture()
  b.on('reset', capture)

  b.plugin(splitRequire, {
    filename: function (record) {
      var extension = path.extname(record.sourceFile)
      var basename = path.basename(record.sourceFile, extension)
      var isIndex = basename === 'index'
      var id = basename
      if (isIndex) id = path.dirname(record.sourceFile).split('/').slice(-1)[0]
      return `bundle-${record.index}-${id}${extension}`
    },
    public: state.base + '/',
    output: bundleDynamicBundle
  })

  b.on('split.pipeline', function (pipeline, entry, name) {
    emit('progress', name, 0)
  })

  var env = Object.assign({ NODE_ENV: state.env }, process.env)

  if (state.env === 'development') {
    b.transform(tfilter(babelify, { filter: include }), {
      plugins: ['dynamic-import-split-require']
    })
    b.transform(inject('source-map-support/register', state.entry))
    b.transform(tfilter(brfs, {
      filter (file) {
        return !file.includes('source-map-support') && include(file)
      }
    }), { global: true })
    b.transform(tfilter(envify, { filter: include }), env)
  } else {
    // compile dynamic imports but nothing else to preserve template literals
    b.transform(tfilter(babelify, { filter: include }), {
      plugins: ['dynamic-import-split-require']
    })

    // include regenerator runtime to support transpiled async/await
    if (!caniuse.isSupported('async-functions', state.browsers.join(','))) {
      const regenerator = require.resolve('regenerator-runtime/runtime')
      b.transform(inject(regenerator, state.entry))
    }

    b.transform(tfilter(nanohtml, { filter: include }))
    b.transform(tfilter(nanohtml, {
      filter (file) {
        return file.includes('node_modules') && include(file)
      }
    }), { global: true })
    b.transform(tfilter(babelify, {
      filter (file) {
        return file.includes('node_modules') && include(file)
      }
    }), {
      global: true,
      babelrc: false,
      presets: [
        [babelPresetEnv, {
          targets: { browsers: state.browsers }
        }]
      ]
    })
    b.transform(tfilter(babelify, { filter: include }), {
      presets: [
        [babelPresetEnv, {
          targets: { browsers: state.browsers }
        }]
      ]
    })
    b.transform(tfilter(brfs, { filter: include }), { global: true })
    b.plugin(tinyify, { env })
  }

  if (state.watch) {
    b = watchify(b)
    b.on('update', function (rows) {
      emit('update', rows)
    })
    b.on('pending', onreset)
  }

  b.on('reset', onreset)
  return function bundle (cb) {
    emit('progress', 'bundle.js', 0)
    var stream = b.bundle()
    stream.on('error', cb)
    stream.pipe(concat({ encoding: 'buffer' }, function (buff) {
      onbundle(buff, 'bundle.js')
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

  // handle dynamic bundle
  // str -> stream.Writable
  function bundleDynamicBundle (name) {
    const stream = concat({ encoding: 'buffer' }, function (bundle) {
      onbundle(bundle, name)
      var asset = state.assets.get(name)
      stream.emit('name', asset.url)
    })
    return stream
  }

  // emit bundled asset
  // (Buffer, str) -> void
  function onbundle (bundle, name) {
    if (state.env === 'development') {
      emit('asset', name, bundle, {
        mime: 'application/javascript'
      })
    } else {
      const src = bundle.toString()
      const map = sourcemap.fromSource(src)
      const buff = Buffer.from(sourcemap.removeComments(src))
      emit('asset', name, buff, {
        mime: 'application/javascript',
        map: Buffer.from(map.toJSON())
      })
    }
  }
}
