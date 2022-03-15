const { isBrowser } = require('browser-or-node')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
const html = require('nanohtml')
const Component = require('nanocomponent')
const nanologger = require('nanologger')
const morph = require('nanomorph')
const nanostate = require('nanostate')
const PlayCount = require('@resonate/play-count')
const MenuButtonOptions = require('@resonate/menu-button-options-component')
const icon = require('@resonate/icon-element')
const renderCounter = require('@resonate/counter')
const { iconFill, text } = require('@resonate/theme-skins')
const TimeElement = require('@resonate/time-element')

class Track extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state

    this.local = {}

    this._handlePlayPause = this._handlePlayPause.bind(this)
    this._handleKeyPress = this._handleKeyPress.bind(this)
    this._handleClick = this._handleClick.bind(this)

    this._isActive = this._isActive.bind(this)
    this._update = this._update.bind(this)

    this.machine = nanostate.parallel({
      hover: nanostate('off', {
        on: { off: 'off' },
        off: { on: 'on' }
      })
    })

    this.log = nanologger(id)

    this.renderMenuButtonOptions = this.renderMenuButtonOptions.bind(this)
  }

  createElement (props = {}) {
    this.local.index = props.index
    this.local.playlist = props.playlist
    this.local.hideCount = props.hideCount
    this.local.hideMenu = props.hideMenu
    this.local.count = props.count
    this.local.fav = props.fav // v1 fav
    this.local.favorite = props.favorite // v2 fav using resolve method
    this.local.src = props.src
    this.local.track = props.track || {}
    this.local.trackGroup = props.trackGroup
    this.local.theme = props.theme || false
    this.local.type = props.type

    const showArtist = props.showArtist
    const isAuthenticated = !!this.state.user.uid
    const showPlayCount = isAuthenticated && this.local.track.status !== 'free' && !this.local.hideCount

    return html`
      <li tabindex=0 class="track-component flex items-center w-100 mb2" onkeypress=${this._handleKeyPress}>
        <div class="flex items-center flex-auto">
          ${this.renderPlaybackButton()}
          <div ondblclick=${this._handleClick} class="metas no-underline truncate flex flex-column pl2 pr2 items-start justify-center w-100">
            <div onclick=${this._handleClick}>
              <span class="pa0 track-title truncate f5 w-100">
                ${this.local.track.title}
              </span>
            </div>
            ${showArtist ? renderArtist(this.local.track.artist) : ''}
          </div>
        </div>
        <div class="flex flex-auto flex-shrink-0 justify-end items-center">
          ${showPlayCount ? renderPlayCount(this.local.count, this.local.track.id) : ''}
          ${!this.local.hideMenu ? this.renderMenuButtonOptions() : ''}
          ${TimeElement(this.local.track.duration, { class: 'duration' })}
        </div>
      </li>
    `

    function renderArtist (name) {
      return html`
        <span class="pa0 track-title truncate f5 w-100 dark-gray mid-gray--dark dark-gray--light">
          ${name}
        </span>
      `
    }

    function renderPlayCount (count, tid) {
      const playCount = new PlayCount(count)

      if (isBrowser) {
        const counter = renderCounter(`cid-${tid}`)
        playCount.counter = counter
      }

      return html`
        <div class="flex items-center">
          ${playCount.counter}
        </div>
      `
    }
  }

  _mouseLeave () {
    return this.machine.state.hover === 'on' && this.machine.emit('hover:off')
  }

  _mouseEnter () {
    if (/Mobi|Android/i.test(navigator.userAgent)) return
    return this.machine.state.hover === 'off' && this.machine.emit('hover:on')
  }

  beforerender (el) {
    el.addEventListener('mouseenter', this._mouseEnter.bind(this))
    el.addEventListener('mouseleave', this._mouseLeave.bind(this))

    this.machine.on('hover:on', this._update)
    this.machine.on('hover:off', this._update)

    const player = this.state.components['player-footer']

    player.playback.on('paused', this._update)
    player.playback.on('playing', this._update)
  }

  unload (el) {
    el.removeEventListener('mouseenter', this._mouseEnter)
    el.removeEventListener('mouseleave', this._mouseLeave)

    this.machine.removeListener('hover:on', this._update)
    this.machine.removeListener('hover:off', this._update)

    const player = this.state.components['player-footer']

    player.playback.removeListener('playing', this._update)
    player.playback.removeListener('paused', this._update)
  }

  update (props) {
    return false
  }

  renderMenuButtonOptions () {
    const cid = `track-menu-button-${this.local.track.id}`
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

    let size = this.local.type === 'album' ? 'sm' : 'md' // button size
    if (/Mobi|iOS/i.test(navigator.userAgent)) {
      size = this.local.type === 'album' ? 'm' : 'l'
    }

    return menuButton.render({
      items: [], // no custom items yet
      selection: Object.entries(selection).filter(([k, v]) => Boolean(v)).map(([k, v]) => k), // selection to array of keys
      data: Object.assign({}, this.local.track, {
        count: this.local.count,
        favorite: this.local.favorite || this.local.fav,
        url: new URL(`/track/${this.local.track.id}`, process.env.APP_HOST || 'https://stream.resonate.coop')
      }),
      size,
      orientation: 'bottomright'
    })
  }

  renderPlaybackButton () {
    const iconSize = this.local.type === 'album' ? 'xs' : 'sm'
    const renderIcon = () => icon(this.playing() ? 'pause' : 'play', { size: iconSize, class: iconFill })
    const renderIndex = () => html`<span class=${text}>${this.local.index}</span>`

    const renderArtwork = () => {
      const imageUrl = this.local.track.cover ? this.local.track.cover.replace('600x600', '120x120').replace('-x600', '-x120') : imagePlaceholder(120, 120)

      return html`
        <span class="db w-100 aspect-ratio aspect-ratio--1x1 bg-near-black">
          <img src=${imageUrl} decoding="auto" class="z-1 aspect-ratio--object">
          ${this._isActive() || this.machine.state.hover === 'on'
            ? html`
              <span class="absolute absolute-fill bg-white-60 bg-black-60--dark bg-white-60--light z-2 flex items-center justify-center w-100 h-100">
                ${renderIcon()}
              </span>`
            : ''}
        </span>
      `
    }

    const withTracking = !this._isActive() && this.local.index !== 0
      ? { on: renderIcon(), off: renderIndex() }[this.machine.state.hover]
      : renderIcon()

    const button = {
      album: withTracking
    }[this.local.type] || renderArtwork()

    const buttonSize = this.local.type === 'album' ? 'w1 h1' : 'w3 h3'

    const attrs = {
      type: 'button',
      title: this.playing() ? 'Pause' : 'Play',
      class: `playback-button pa0 ${buttonSize} relative bn bg-transparent flex-shrink-0`,
      onclick: this._handlePlayPause
    }

    return html`
      <button ${attrs}>
        <div class="play-button-inner flex items-center justify-center absolute w-100 h-100 top-0">
          ${button}
        </div>
      </button>
    `
  }

  _handleKeyPress (e) {
    if (e.key === 'Enter') {
      return this._handlePlayPause(e)
    }
  }

  _handlePlayPause (e) {
    e.preventDefault()
    e.stopPropagation()

    const player = this.state.components['player-footer']

    if (!player) return

    const isNew = player.track.id !== this.local.track.id

    if (isNew) {
      player.src = this.local.src
      player.track = this.local.track
      player.trackGroup = this.local.trackGroup
      player.fav = this.local.fav
      player.count = this.local.count
      player.playlist = this.local.playlist
      player.index = this.local.playlist.findIndex((item) => item.track.id === this.local.track.id)
    }

    const eventName = {
      idle: 'play',
      playing: 'pause',
      paused: 'play',
      stopped: 'play'
    }[player.playback.state]

    if (!eventName) return false

    this.log.info(eventName)

    player.playback.emit(eventName)

    if (isNew && player.playback.state === 'paused') {
      player.playback.emit('play')
    }

    this._update()
  }

  _handleClick (e) {
    if (e.target.nodeName !== 'button') {
      return this._handlePlayPause(e)
    }
  }

  _isActive () {
    const player = this.state.components['player-footer']

    if (!player) return false

    return this.local.track.id === player.track.id
  }

  playing () {
    const player = this.state.components['player-footer']

    if (!player) return false

    return this._isActive() && player.playback.state === 'playing'
  }

  _update () {
    if (!this.element) return
    morph(this.element.querySelector('.playback-button'), this.renderPlaybackButton())
  }
}

module.exports = Track
