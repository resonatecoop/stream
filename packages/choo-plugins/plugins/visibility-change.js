const nanologger = require('nanologger')
const log = nanologger('visibility-change')

function visibilityChange () {
  return function (state, emitter) {
    state.events.VISIBILITYCHANGE = 'VISIBILITYCHANGE'

    emitter.on(state.events.DOMCONTENTLOADED, () => {
      var visProp = getHiddenProp()

      if (visProp) {
        var evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange'
        document.addEventListener(evtname, visChange)
      }

      function visChange () {
        if (isHidden()) {
          emitter.emit(state.events.VISIBILITYCHANGE, 'HIDDEN')
          log.info('HIDDEN')
        } else {
          emitter.emit(state.events.VISIBILITYCHANGE, 'VISIBLE')
          log.info('VISIBLE')
        }
      }
    })
  }
}

function getHiddenProp () {
  var prefixes = ['webkit', 'moz', 'ms', 'o']

  // if 'hidden' is natively supported just return it
  if ('hidden' in document) return 'hidden'

  // otherwise loop over all the known prefixes until we find one
  for (var i = 0; i < prefixes.length; i++) {
    if ((prefixes[i] + 'Hidden') in document) { return prefixes[i] + 'Hidden' }
  }

  // otherwise it's not supported
  return null
}

function isHidden () {
  var prop = getHiddenProp()
  if (!prop) return false

  return document[prop]
}

module.exports = visibilityChange
