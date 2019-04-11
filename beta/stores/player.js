/**
 * Logging
 */

const PlayCount = require('@resonate/play-count')
const renderCounter = require('@resonate/counter')
const logger = require('nanologger')
const log = logger('store:player')
// const storage = require('localforage')

module.exports = player

function updateCounter (props, element) {
  const { count, track } = props
  const { id } = track

  const playCount = new PlayCount(count)

  const counter = renderCounter(`cid-${id}`)

  playCount.counter = counter

  if (element) {
    const parent = element.parentNode
    parent.replaceChild(playCount.counter, element)
  }
}

function setPlaycount (props) {
  const { track } = props
  for (let counter of [...document.querySelectorAll(`#cid-${track.id}`)]) {
    updateCounter(props, counter)
  }
}

function player () {
  return (state, emitter) => {
    state.track = state.track || {
      data: {}
    }

    emitter.on('player:error', (props) => {
      const { reason } = props
      emitter.emit('notify', { type: 'error', timeout: 15000, message: reason })
    })

    emitter.on('player:cap', async (track) => {
      try {
        const response = await state.api.plays.add({
          uid: state.api.user.uid, // 0 if user is not authenticated
          tid: track.id
        })

        if (response.status === 401) {
          log.info('User is not authorized to play')
          return emitter.emit('notify', { message: 'Not authorized to play' })
        }

        setPlaycount({ count: response.data.count, track })

        let message = `Saved a play for ${track.title}`

        if (response.data.cost === 0) {
          message = `Saved a play for ${track.title} (free)`
        }

        emitter.emit('notify', { type: 'success', message })

        if (response.data.count < 9) {
          emitter.emit('notify', { type: 'success', message: `You have ${9 - response.data.count} plays remaining until you own this track` })
        }
      } catch (err) {
        log.error(err)
      }
    })
  }
}
