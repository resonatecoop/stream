/* global Audio, fetch, Headers, URL */

const { isBrowser } = require('browser-or-node')
const Nanobus = require('nanobus')
const logger = require('nanologger')
const log = logger('nanoplayer')

const eventNames = [
  'canplay',
  'play',
  'pause',
  'ended',
  'error',
  'timeupdate',
  'progress',
  'seeking',
  'seeked',
  'loadedmetadata'
]

class NanoPlayer extends Nanobus {
  constructor (audioNode = new Audio(), props = {}) {
    super()

    const self = this

    this.events = {
      canplay: () => {

      },
      play: (e) => {
        self.emit('playing')
      },
      pause: () => {
        self.emit('paused')
      },
      ended: () => {
        self.emit('ended')
      },
      error: (e) => {
        switch (self.audio.error.code) {
          case e.target.error.MEDIA_ERR_ABORTED:
            self.emit('error', 'You aborted the audio playback.')
            break
          case e.target.error.MEDIA_ERR_NETWORK:
            self.emit('error', 'A network error caused the audio download to fail.')
            break
          case e.target.error.MEDIA_ERR_DECODE:
            self.emit('error', 'The audio playback was aborted due to a corruption problem or because the video used features your browser did not support.')
            break
          case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            self.emit('error', 'This track could not be loaded, either because the server or network failed or because the format is not supported.')
            break
          default:
            self.emit('error', 'An unknown error occurred.')
            break
        }
      },
      timeupdate: () => {
        self.emit('timeupdate', self.audio.currentTime)
      },
      progress: () => {
        self.emit('progress')
      },
      seeking: () => {

      },
      seeked: () => {

      },
      loadedmetadata: () => {
        self.emit('loadedmetadata')
      }
    }

    this.state = Object.assign(props, {
      playlist: [],
      autoplay: false,
      loop: false,
      src: null, // current audio src
      playing: false,
      played: false,
      preload: false,
      volume: 1,
      muted: false
    })

    this.audio = audioNode
  }

  async load (src, opts = {}) {
    const { useFetch = false, token } = opts

    if (!isBrowser) return false

    this.unload() // unload events

    if (useFetch) {
      try {
        if (this.audio.src && this.state.src !== src) {
          URL.revokeObjectURL(this.audio.src)
        }

        const headers = new Headers()

        if (token) {
          headers.append('Authorization', `Bearer ${token}`)
        }

        const response = await fetch(src, {
          headers: headers
        })

        const blob = await response.blob()

        if (blob) {
          this.state.src = src
          this.audio.src = URL.createObjectURL(blob)

          log.info('loaded src')

          eventNames.forEach(eventName => {
            this.audio.addEventListener(eventName, this.events[eventName])
          })
        } else {
          log.error('failed to load src')
        }
      } catch (err) {
        log.error(err)
      }
    } else {
      this.state.src = src
      this.audio.src = src

      log.info('loaded src')

      eventNames.forEach(eventName => {
        this.audio.addEventListener(eventName, this.events[eventName])
      })
    }
  }

  unload () {
    eventNames.forEach(eventName => {
      this.audio.removeEventListener(eventName, this.events[eventName])
    })
  }

  play () {
    const playPromise = this.audio.play()

    if (playPromise !== undefined) {
      playPromise.then(() => {
        log.info('playing new audio')
      }).catch(error => {
        log.error(error)
      })
    }
  }

  pause () {
    this.emit('paused')
    this.audio.pause()
  }

  stop () {
    this.emit('stop')
    this.audio.pause()
    this.audio.currentTime = 0
  }

  volume (lev) {
    this.emit('volume', lev)
    this.audio.volume = lev
  }

  mute () {
    this.emit('muted')
    this.audio.muted = true
  }

  unmute () {
    this.emit('unmuted')
    this.audio.muted = false
  }

  seek (progress) {
    this.audio.currentTime = this.audio.duration * progress
    this.emit('seek', this.audio.currentTime)
  }
}

module.exports = NanoPlayer
