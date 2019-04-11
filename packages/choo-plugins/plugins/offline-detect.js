const nanologger = require('nanologger')
const log = nanologger('offline-detect')

/*
 * Detect if user device goes offline
 */

function offlineDetect () {
  return function (state, emitter) {
    state.events.ONLINE = 'ONLINE'
    state.events.OFFLINE = 'OFFLINE'

    emitter.on(state.events.DOMCONTENTLOADED, function () {
      window.addEventListener('online', function (e) {
        var status = navigator.onLine
        emitter.emit(state.events.ONLINE, status)
        log.info(status)
      }, false)

      window.addEventListener('offline', function (e) {
        var status = navigator.onLine
        emitter.emit(state.events.OFFLINE, status)
        log.info(status)
      }, false)
    })
  }
}

module.exports = offlineDetect
