const Nanobounce = require('nanobounce')
const nanobounce = Nanobounce() // timeout defaults to 256ms.

module.exports = onResize

function onResize () {
  return (state, emitter) => {
    emitter.on(state.events.DOMCONTENTLOADED, () => {
      window.onresize = onResize
    })

    function onResize (e) {
      nanobounce(() => {
        emitter.emit('resize', e)
      })
    }
  }
}
