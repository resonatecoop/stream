/* global MediaMetadata, matchMedia */

const { isBrowser } = require('browser-or-node')
const assert = require('assert')
const html = require('nanohtml')
const Nanocomponent = require('nanocomponent')
const nanostate = require('nanostate')
const morph = require('nanomorph')
const renderCounter = require('@resonate/counter')
const button = require('@resonate/button')
const Artwork = require('@resonate/artwork-component')
const PlayCount = require('@resonate/play-count')
const NanoPlayer = require('@resonate/nanoplayer')
const MenuButtonOptions = require('@resonate/menu-button-options-component')
const Seeker = require('@resonate/seeker-component')
const VolumeControl = require('@resonate/volume-control-component')
const RoComponent = require('resize-observer-component')
const Ro = require('resize-observer-polyfill')
const Nanobounce = require('nanobounce')
const nanobounce = Nanobounce()
const TimeElement = require('@resonate/time-element')
const { borders: borderColors } = require('@resonate/theme-skins')
const svgImagePlaceholder = require('@resonate/svg-image-placeholder')

/*
 * Logging
 */

const logger = require('nanologger')
const log = logger('player')

const sound = isBrowser ? new NanoPlayer() : null

class Player extends Nanocomponent {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit

    this.local = state.components[id] = Object.create({
      playback: nanostate('idle', {
        idle: { play: 'playing' },
        playing: { pause: 'paused', stop: 'stopped' },
        paused: { play: 'playing', stop: 'stopped' },
        stopped: { play: 'playing' }
      }),
      machine: nanostate.parallel({
        fullscreen: nanostate('off', {
          on: { toggle: 'off' },
          off: { toggle: 'on' }
        })
      })
    })

    this._update = this._update.bind(this)

    this.local.volume = 1
    this.local.progress = 0
    this.local.track = {}
    this.local.currentTime = 0
    this.local.duration = 0

    this.local.playback.event('previous', nanostate('previous', {
      previous: { play: 'playing', stop: 'stopped' }
    }))

    this.local.playback.event('next', nanostate('next', {
      next: { play: 'playing', stop: 'stopped' }
    }))

    this.local.playback.on('playing', () => {
      if (!this.local.src) return // error

      log.info('Playing')

      // TODO send request to check if user can play

      this.local.src = setUrlParams(this.local.src, this.local.clientId
        ? { client_id: this.local.clientId }
        : this.state.user.credits < 0.002 ? { preview: true } : {})

      const isNew = sound.state.src !== this.local.src

      if (isNew) {
        this.local.played = false

        sound.load(this.local.src)
      }

      sound.play()

      this._update(isNew)

      this.local.index = this.local.playlist.findIndex(item => item.track.id === this.local.track.id)

      if ('mediaSession' in navigator) {
        const metadata = {
          title: this.local.track.title,
          artist: this.local.track.artist,
          album: this.local.track.album,
          artwork: []
        }

        const size = {
          120: '120x120',
          600: '600x600',
          1500: '1500x1500'
        }

        if (this.local.track.images && this.local.track.images.length) {
          metadata.artwork = this.local.track.images.map(({ src, width }) => {
            return {
              src: src.replace('.webp', '.jpg'),
              sizes: size(width),
              type: 'image/jpeg'
            }
          })
        } else if (this.local.track.cover) {
          metadata.artwork.push({
            src: this.local.track.cover.replace('.webp', '.jpg'),
            sizes: '120x120',
            type: 'image/jpeg'
          })
          metadata.artwork.push({
            src: this.local.track.cover.replace('120x120', '600x600').replace('x120', 'x600'),
            sizes: '600x600',
            type: 'image/jpeg'
          })
        }

        navigator.mediaSession.metadata = new MediaMetadata(metadata)
      }
    })

    this.local.playback.on('paused', () => {
      log.info('Paused')

      sound.pause()

      this._update()
    })

    this.local.playback.on('stopped', () => {
      log.info('Stopped')

      sound.stop()

      this.local.played = false

      this._update()
    })

    this.local.playback.on('previous', () => {
      if (isNaN(this.local.index)) return false
      if (this.local.index === -1) return false
      const index = this.local.index - 1
      const prev = this.local.playlist[index]

      if (prev) {
        log.info('Previous', prev)

        this.local.index = index
        this.local.src = prev.url
        this.local.track = prev.track
        this.local.trackGroup = prev.track_group
        this.local.count = prev.count

        this.local.playback.emit('play')

        this.emit('player:previous', {
          track: prev
        })
      }
    })

    this.local.playback.on('next', () => {
      if (isNaN(this.local.index)) return false
      if (this.local.index === -1) return false

      const index = this.local.index + 1
      const next = this.local.playlist[index]

      if (next) {
        log.info('Next', next)

        this.local.index = index
        this.local.src = next.url
        this.local.track = next.track
        this.local.trackGroup = next.track_group
        this.local.count = next.count

        this.local.playback.emit('play')

        this.emit('player:next', {
          track: next
        })
      } else {
        this.local.played = false
        this.local.playback.emit('stop')
      }
    })

    this.local.machine.on('fullscreen:toggle', () => {
      log.info('fullscreen:toggle')
      this._update(true)
    })

    if (isBrowser) {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          this.local.playback.emit('previous')
        })
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          this.local.playback.emit('next')
        })
        navigator.mediaSession.setActionHandler('play', () => {
          this.local.playback.emit('play')
        })
        navigator.mediaSession.setActionHandler('pause', () => {
          this.local.playback.emit('pause')
        })
      }
    }

    if (sound !== null) {
      sound.on('loadedmetadata', () => {
        this.local.duration = sound.audio.duration

        if (this.element) {
          morph(this.element.querySelector('.duration'), TimeElement(this.local.duration, { class: 'duration' }))
        }
      })

      sound.on('ended', () => {
        this.local.playback.emit('next')
      })

      sound.on('timeupdate', (currentTime) => {
        const nowPlaying = `${this.local.track.artist} · ${this.local.track.title}`
        if (document.title !== nowPlaying) {
          document.title = nowPlaying
        }

        this.local.currentTime = currentTime
        this.local.progress = 100 * currentTime / sound.audio.duration

        const seeker = this.state.components['player-seeker']

        if (seeker) {
          seeker.progress = this.local.progress
        }

        if (this.element) {
          const seekerEl = this.element.querySelector('#seeker')

          if (seekerEl) {
            seekerEl.rangeSlider.update({
              value: this.local.progress
            })
          }
        }

        /**
         * Once listener reach 45 seconds play time
         * we should save a play (paid or free)
         */

        if (currentTime >= 45 && !this.local.played) {
          this.local.played = true

          this.emit('player:cap', this.local.track)
        }

        if (this.element) {
          morph(this.element.querySelector('.currentTime'), TimeElement(currentTime))
        }
      })

      sound.on('error', (reason) => {
        this.emit('player:error', { reason })
      })
    }

    this.renderMenuButtonOptions = this.renderMenuButtonOptions.bind(this)
  }

  playing () {
    return this.local.playback.state === 'playing'
  }

  createElement (props = {}) {
    assert.strictEqual(typeof props, 'object', 'props should be an object')

    this.local.hideMenu = props.hideMenu || false
    this.local.hideCount = props.hideCount || true
    this.local.applicationHostname = props.applicationHostname || process.env.APP_HOST || 'https://stream.resonate.coop'
    this.local.inIframe = props.inIframe || false

    if (!this.local.track.id) {
      this.local.clientId = props.clientId
      this.local.track = props.track || {}
      this.local.playlist = props.playlist || []
      this.local.trackGroup = props.trackGroup || [{}]
      this.local.count = props.count || 0
      this.local.index = this.local.playlist.findIndex((item) => item.track.id === this.local.track.id)

      if (props.src !== null && props.src !== this.local.src) {
        this.local.src = setUrlParams(props.src, this.local.clientId
          ? { client_id: this.local.clientId }
          : this.state.user.credits < 0.002 ? { preview: true } : {})

        sound.load(this.local.src)
      }
    }

    const playerComponent = this.renderPlayer()
    const container = new RoComponent()

    return html`
      <div class="flex flex-column h-100">
        ${container.render(playerComponent)}
      </div>
    `
  }

  renderPlayer () {
    const isAuthenticated = !!this.state.user.uid
    const infoBarClasses = 'flex flex-row w-100 justify-center bb b--light-silver no-underline'

    return html`
      <div class="player-component flex flex-column h-100">
        ${!isAuthenticated
          ? html`<a class=${infoBarClasses} href="/login" target="_blank" rel="noopener noreferer">Log in to listen to full song</a>`
          : Number(this.state.user.credits) < 1
            ? html`<a class=${infoBarClasses}>You have less than one credit remaining</a>`
            : ''}
        ${this.renderArtwork()}
        ${this.renderControls()}
      </div>
    `
  }

  renderControls () {
    const hasPlaylist = Array.isArray(this.local.playlist) && this.local.playlist.length

    const renderInfos = (props) => {
      const { title, artist, creator_id: id } = props
      const attrs = {
        href: `/artist/${id}`,
        class: 'link no-underline color-inherit track-artist truncate f5 dark-gray mid-gray--dark dark-gray--light'
      }

      if (this.local.inIframe) {
        attrs.href = `${this.local.applicationHostname}/artist/${id}`
        attrs.target = '_blank'
      }

      return html`
        <div class="infos flex flex-auto w-auto w-33-l justify-center flex-column">
          <span class="track-title truncate f5">
            ${title}
          </span>
          <a ${attrs}>
            ${artist}
          </a>
        </div>
      `
    }

    const playPauseButton = button({
      style: 'blank',
      size: 'md',
      prefix: 'play-button',
      onClick: () => {
        return this.local.playback.emit(this.playing() ? 'pause' : 'play')
      },
      title: this.playing() ? 'Pause' : 'Play',
      iconName: this.playing() ? 'pause' : 'play'
    })

    const prevButton = button({
      style: 'blank',
      size: 'md',
      disabled: !hasPlaylist || this.local.index < 1,
      onClick: (e) => this.local.playback.emit('previous'),
      title: 'Previous',
      iconName: 'previous'
    })

    const nextButton = button({
      style: 'blank',
      size: 'md',
      disabled: !hasPlaylist,
      onClick: (e) => this.local.playback.emit('next'),
      title: 'Next',
      iconName: 'next'
    })

    const renderPlayCount = () => {
      const playCount = new PlayCount(this.local.count)
      if (isBrowser) {
        playCount.counter = renderCounter(`cid-${this.local.track.id}`)
      }
      return html`
        <div class="flex items-center mr2 ph2">
          ${playCount.counter}
        </div>
      `
    }

    const renderFullScreenButton = (props) => {
      const title = this.local.machine.state.fullscreen === 'on' ? 'Disable fullscreen' : 'Enable fullscreen'
      const imageUrl = this.local.track.cover ? this.local.track.cover.replace('600x600', '120x120').replace('-x600', '-x120') : svgImagePlaceholder()
      const handleClick = (e) => this.local.machine.emit('fullscreen:toggle')

      return html`
        <div class="flex">
          <button title=${title} class="h3 w3 relative bn bg-transparent" onclick=${handleClick}>
            <span class="w-100 db aspect-ratio aspect-ratio--1x1 bg-near-black">
              <img src=${imageUrl} decoding="auto" class="aspect-ratio--object">
            </span>
          </button>
        </div>
      `
    }

    const renderSeeker = (options = {}) => {
      if (breakpoint('lg') || options.force) {
        const seeker = new Seeker('player-seeker', this.state, this.emit)

        return html`
          <div class="seeker z-1 flex flex-auto flex-column relative bw bl br ${borderColors}">
            ${seeker.render({
              progress: this.local.progress,
              onSlide: (value, percent, position) => {
                this.local.progress = value
                sound.mute()
                sound.seek(percent)
              },
              onSlideEnd: (value, percent, position) => {
                this.local.progress = value
                sound.seek(percent)
                sound.unmute()
              }
            })}
            <div class="absolute w-100 h-100 flex items-center justify-center" style="z-index:-1;">
              <span class="pl2 flex flex-auto">${TimeElement(this.local.currentTime)}</span>
              <span class="pr2 flex flex-auto justify-end">
                ${TimeElement(this.local.duration, { class: 'duration' })}
              </span>
            </div>
          </div>
        `
      }
    }

    const renderVolumeControl = (options = {}) => {
      if (breakpoint('ns') || options.force) {
        this.volumeControl = new VolumeControl('volume-control', this.state, this.emit)

        return this.volumeControl.render({
          vertical: true,
          volume: this.local.volume,
          onSlide: (value, percent, position) => {
            sound.volume(percent)
          }
        })
      }
    }

    return {
      on: () => {
        return html`
          <div class="controls flex flex-column flex-auto flex-column h-100 bt bw b--mid-gray b--near-black--dark">
            <div class="flex flex-auto">
              <div class="flex w-100 flex-auto ml2">
                ${renderVolumeControl({ force: true })}
              </div>
              <div class="flex w-100 justify-center flex-auto">
                ${prevButton}
                ${playPauseButton}
                ${nextButton}
              </div>
              <div class="flex w-100 flex-auto justify-end mr2">
                ${!this.local.hideCount ? renderPlayCount() : ''}
              </div>
            </div>
            <div class="bg-near-white bg-near-white--light bg-near-black--dark flex flex-auto w-100 h2">
              ${renderSeeker({ force: true })}
            </div>
            <div class="flex w-100 flex-auto">
              <div class="flex flex-auto w-100">
                ${renderFullScreenButton()}
                ${renderInfos(this.local.track)}
                ${!this.local.hideMenu ? this.renderMenuButtonOptions() : ''}
              </div>
            </div>
          </div>
        `
      },
      off: () => {
        return html`
          <div class="controls flex flex-auto w-100">
            ${renderFullScreenButton()}
            ${renderInfos(this.local.track)}
            <div class="flex flex-auto-l w-auto w-100-l justify-end">
              ${renderSeeker()}
              <div class="flex items-center">
                ${!this.local.hideMenu ? this.renderMenuButtonOptions() : ''}
                ${renderVolumeControl({ force: true })}
                ${playPauseButton}
                ${nextButton}
              </div>
            </div>
          </div>
        `
      }
    }[this.local.machine.state.fullscreen]()
  }

  renderMenuButtonOptions () {
    const cid = `player-menu-button-${this.local.track.id}`
    const menuButton = new MenuButtonOptions(cid, this.state, this.emit)

    // replace !!this.state.user.id with proper isAuthenticated() helper
    const favorite = this.local.favorite || this.local.fav ? 'unfavorite' : 'favorite'
    const isAuthenticated = !!this.state.user.uid
    const selection = {
      profile: true,
      [favorite]: isAuthenticated, // replace with unfavorite
      playlist: isAuthenticated,
      buy: isAuthenticated && this.local.count < 9,
      download: isAuthenticated && this.local.count > 8,
      share: true
    }

    return menuButton.render({
      items: [], // no custom items yet
      selection: Object.entries(selection).filter(([k, v]) => Boolean(v)).map(([k, v]) => k), // selection to array of keys
      data: Object.assign({}, this.local.track, {
        count: this.local.count,
        favorite: this.local.favorite || this.local.fav,
        url: new URL(`/track/${this.local.track.id}`, process.env.APP_HOST || 'https://stream.resonate.coop')
      }),
      size: this.local.type === 'album' ? 'sm' : 'md', // button size
      orientation: 'topright'
    })
  }

  renderArtwork () {
    const artworkUrl = this.local.track.cover ? this.local.track.cover.replace('120x120', '600x600').replace('-x120', '-x600') : svgImagePlaceholder()

    return {
      on: () => {
        const image = new Artwork().render({
          url: artworkUrl,
          style: {
            width: 'auto',
            maxHeight: 'calc(100vh - (var(--height-3)*3) - 5rem)' /* minus both menu heights and footer player */
          },
          animate: true
        })

        const disableFullScreenButton = button({
          style: 'blank',
          prefix: 'absolute z-1 top-1 right-1',
          onClick: (e) => this.local.machine.emit('fullscreen:toggle'),
          title: 'Disable fullscreen',
          iconName: 'close'
        })

        return html`
          <div class="artwork-fullscreen w-100 h-100">
            ${disableFullScreenButton}
            <div class="player-artwork flex flex-auto justify-center items-start w-100 h-100 relative">
              ${image}
            </div>
          </div>
        `
      },
      off: () => {}
    }[this.local.machine.state.fullscreen]()
  }

  beforerender () {
    this.resizeObserver = new Ro((entries, observer) => {
      nanobounce(() => {
        if (this.local.machine.state.fullscreen === 'off') {
          this._update(true)
        }
      })
    })

    this.resizeObserver.observe(document.body)
  }

  load (el) {
    log.info('Player element loaded')
  }

  unload () {
    this.resizeObserver.unobserve(document.body)
  }

  _update (force = false) {
    if (!this.element) return

    if (force === true) {
      return morph(this.element.querySelector('.player-component'), this.renderPlayer())
    }

    const b = this.element.querySelector('.play-button')
    const playing = this.playing()

    morph(b, button({
      style: 'blank',
      size: 'md',
      prefix: 'play-button',
      onClick: () => {
        return this.local.playback.emit(this.playing() ? 'pause' : 'play')
      },
      title: playing ? 'Pause' : 'Play',
      iconName: playing ? 'pause' : 'play'
    }))
  }

  update (props = {}) {
    if (this.local.clientId !== props.clientId) {
      this.local.clientId = props.clientId

      if (this.local.src) {
        this.local.src = setUrlParams(this.local.src, this.local.clientId
          ? { client_id: this.local.clientId }
          : this.state.user.credits < 0.002 ? { preview: true } : {})

        this.local.played = false

        sound.load(this.local.src)
      }

      this._update(true)
    }
    if (!this.local.src) {
      log.info('Updating src')

      this.local.track = props.track || {}
      this.local.trackGroup = props.trackGroup || [{}]
      this.local.count = props.count || 0
      this.local.played = false
      this.local.playlist = props.playlist || []
      this.local.index = this.local.playlist.findIndex((item) => item.track.id === this.local.track.id)

      if ((props.src && props.src !== this.local.src) || props.clientId !== this.local.clientId) {
        this.local.src = setUrlParams(props.src, this.local.clientId
          ? { client_id: this.local.clientId }
          : this.state.user.credits < 0.002 ? { preview: true } : {})

        this.local.played = false

        sound.load(this.local.src)
      }

      this._update(true)
    }

    return false
  }
}

module.exports = Player

function setUrlParams (src, params) {
  const url = new URL(src)
  url.search = new URLSearchParams(params)
  return url.href
}

function breakpoint (size) {
  if (!isBrowser) return true

  const breakpoint = {
    ns: 'screen and (min-width: 30em)',
    m: 'screen and (min-width: 30em) and (max-width: 60em)',
    lg: 'screen and (min-width: 60em)'
  }[size]

  return matchMedia(breakpoint).matches
}
