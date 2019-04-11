const nanologger = require('nanologger')
const log = nanologger('offline-detect')

function fullScreen () {
  return function (state, emitter) {
    state.events.LAUNCHINTOFULLSCREEN = 'LAUNCHINTOFULLSCREEN'
    state.events.EXITFULLSCREEN = 'EXITFULLSCREEN'

    emitter.on(state.events.DOMCONTENTLOADED, function () {
      emitter.on(state.events.LAUNCHINTOFULLSCREEN, function (element) {
        if (element.requestFullscreen) {
          element.requestFullscreen()
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen()
        } else if (element.webkitRequestFullscreen) {
          element.webkitRequestFullscreen()
        } else if (element.msRequestFullscreen) {
          element.msRequestFullscreen()
        }

        state.fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement
        state.fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled

        log.info('fullscreen enabled')
      })

      emitter.on(state.events.EXITFULLSCREEN, function () {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen()
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen()
        }

        state.fullscreenElement = null
        state.fullscreenEnabled = false

        log.info('fullscreen disabled')
      })
    })
  }
}

module.exports = fullScreen
