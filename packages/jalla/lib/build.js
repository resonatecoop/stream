var fs = require('fs')
var util = require('util')
var path = require('path')

var createDir = util.promisify(fs.mkdir)
var writeFile = util.promisify(fs.writeFile)

module.exports = build

function build (state, emit) {
  return function bundle (cb) {
    var re = new RegExp(`^(?:${state.base.replace(/\//g, '\\/')})?\\/`)
    var assets = Array.from(state.assets.values(), function (asset) {
      asset.file = asset.url.replace(re, '')
      return asset
    })

    var stat = JSON.stringify({
      browsers: state.browsers,
      assets: assets
    }, stringify, 2)

    emit('progress', 'stat.json', 0)

    Promise.all([
      Promise.all(assets.map(async function (asset) {
        var file = path.resolve(state.dist, 'public', asset.file)
        emit('progress', asset.id, 0)
        try {
          await createDir(path.dirname(file), { recursive: true })
        } catch (err) {
          // Ignore failed `mkdir` and try writing file anyway
        }
        return writeFile(file, asset.buffer)
      })),
      writeFile(path.resolve(state.dist, 'stat.json'), stat)
    ]).then(cb.bind(undefined, null), cb)
  }
}

// JSON.stringify replacer
// (str, any) -> str|undefined
function stringify (key, value) {
  if (key === 'buffer' || key === 'map') return
  return value
}
