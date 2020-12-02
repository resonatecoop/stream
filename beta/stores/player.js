const { isBrowser } = require('browser-or-node')
const logger = require('nanologger')
const log = logger('store:player')
const Player = require('@resonate/player-component')
const setPlaycount = require('../lib/update-counter')

module.exports = player

function player () {
  return (state, emitter) => {
    const player = isBrowser ? state.cache(Player, 'player-footer') : {}

    state.track = state.track || {
      data: {}
    }

    emitter.on('player:error', (props) => {
      const { reason } = props

      emitter.emit('notify', {
        type: 'error',
        host: document.body,
        timeout: 4000,
        message: reason
      })
    })

    emitter.on('player:cap', async (track) => {
      try {
        const response = await state.api.plays.add({
          uid: state.user.uid, // 0 if user is not authenticated
          tid: track.id
        })

        if (response.status === 401) {
          log.info('User is not authorized to play')

          player.playback.emit('stop')

          emitter.emit('notify', { message: 'You are not logged in' })

          return emitter.emit('logout', true) // logout and redirect
        }

        if (response.data && response.status === 'ok') {
          const { count, total } = response.data

          if (count >= 1) {
            setPlaycount({ count, id: track.id })

            log.info(`Tracked a play count for ${track.title}`)
          }

          window.localStorage.setItem('credits', total)
        }
      } catch (err) {
        log.error(err)
      } finally {
        emitter.emit(state.events.RENDER)
      }
    })
  }
}
