/**
 * Logging
 */

const logger = require('nanologger')
const log = logger('store:tracks')
const adapter = require('@resonate/schemas/adapters/v1/track')
const storage = require('localforage')
const copy = require('clipboard-copy')

module.exports = tracks

function tracks () {
  return (state, emitter) => {
    state.track = state.track || {
      data: {}
    }

    emitter.on('clipboard', (text) => {
      copy(text)
      emitter.emit('notify', { message: 'Copied to clipboard' })
    })

    emitter.on('route:tracks/:id', async () => {
      const id = parseInt(state.params.id, 10)
      const isNew = state.track.data.id !== id

      if (!isNew) return

      state.track = {
        data: {}
      }

      emitter.emit(state.events.RENDER)

      try {
        const data = await storage.getItem(`track:${id}`)

        if (data) {
          state.track = data
          return emitter.emit(state.events.RENDER)
        }

        const response = await state.api.tracks.findOne({ id })

        if (response.data) {
          state.track.data = adapter(response.data)

          storage.setItem(`track:${id}`, state.track)

          emitter.emit(state.events.RENDER)
        }
      } catch (err) {
        log.error(err)
      }
    })
  }
}
