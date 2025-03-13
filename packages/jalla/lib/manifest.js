var path = require('path')
var readPkgUp = require('read-pkg-up')

module.exports = manifest

function manifest (state, emit) {
  return async function (cb) {
    if (state.assets.get('manifest.json')) return cb()

    try {
      emit('progress', 'manifest.json', 0)

      var res = await readPkgUp({ cwd: path.dirname(state.entry) })
      var { name } = res.packageJson

      var buff = Buffer.from(JSON.stringify({
        name: name,
        short_name: name.length > 12 ? name.substr(0, 12) + '…' : name,
        start_url: '/',
        display: 'minimal-ui',
        background_color: '#fff',
        theme_color: '#fff'
      }))

      emit('asset', 'manifest.json', buff, {
        static: true,
        mime: 'application/json'
      })
      cb()
    } catch (err) {
      cb(err)
    }
  }
}
