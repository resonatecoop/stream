const { isBrowser } = require('browser-or-node')
const logger = require('nanologger')
const log = logger('store:player')
const Player = require('@resonate/player-component')
const setPlaycount = require('../lib/update-counter')
const { getAPIServiceClientWithAuth } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST,
  base: process.env.API_BASE || '/api/v3'
})

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
        if (state.user.uid) {
          const getClient = getAPIServiceClientWithAuth(state.user.token)
          const client = await getClient('plays')

          const result = await client.addPlay({
            play: {
              track_id: track.id
            }
          })

          const { body: response } = result

          console.log(response)

          if (response.status === 401) {
            log.info('User is not authorized to play')

            player.playback.emit('stop')

            emitter.emit('notify', { message: 'You are not logged in' })

            return emitter.emit('logout', true) // logout and redirect
          } else {
            const { count, total } = response.data

            if (count >= 1) {
              setPlaycount({ count, id: track.id })

              log.info(`Tracked a play count for ${track.title}`)
            }

            state.credits = total
          }
        } else {
          // play count log
        }
      } catch (err) {
        log.error(err)
      } finally {
        emitter.emit(state.events.RENDER)
      }
    })
  }
}
