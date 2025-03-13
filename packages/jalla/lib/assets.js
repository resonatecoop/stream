var fs = require('fs')
var util = require('util')
var path = require('path')
var chokidar = require('chokidar')

var readFile = util.promisify(fs.readFile)

module.exports = assets

function assets (state, emit) {
  var watcher
  var queue = new Set()
  var dir = path.resolve(path.dirname(state.entry), 'assets')

  return function (cb) {
    if (watcher) return cb()
    watcher = chokidar.watch(dir)
    watcher.on('add', function (file) {
      handler(file)
    })
    watcher.on('change', function (file) {
      handler(file)
      emit('update')
    })
    watcher.on('error', cb)
    watcher.on('unlink', remove)
    watcher.on('ready', function () {
      Promise.all(Array.from(queue)).then(function () {
        if (!state.watch) watcher.close()
        cb()
      })
    })
  }

  // register assets with jalla
  // str -> void
  function handler (file) {
    var uri = path.relative(dir, file)

    emit('progress', uri, 0)

    var promise = readFile(file).then(function (buff) {
      emit('asset', uri, buff, { static: true })
    }, function (err) {
      emit('error', err)
    })

    queue.add(promise)

    promise.then(function () {
      queue.delete(promise)
    })
  }

  // unregister asset with jalla
  // str -> void
  function remove (file) {
    var uri = path.relative(dir, file)
    emit('remove', uri)
  }
}
