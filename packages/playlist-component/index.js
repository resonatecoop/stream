const assert = require('assert')
const html = require('nanohtml')
const Component = require('nanocomponent')
const compare = require('nanocomponent/compare')
const nanologger = require('nanologger')
const nanostate = require('nanostate')
const clone = require('shallow-clone')
const ResponsiveContainer = require('resize-observer-component')
const Loader = require('@resonate/play-count')
const renderCounter = require('@resonate/counter')
const Track = require('@resonate/track-component')

/*
 * Component for interacting with tracks
 */

class Playlist extends Component {
  constructor (name, state, emit) {
    super(name)

    this.emit = emit
    this.state = state

    this.log = nanologger(name)

    this.renderPlaylist = this.renderPlaylist.bind(this)
    this.renderLoader = this.renderLoader.bind(this)

    this.machine = nanostate('idle', {
      idle: { 'start': 'loading' },
      loading: { 'resolve': 'idle', reject: 'error' },
      error: { 'start': 'idle' }
    })

    this.machine.event('notFound', nanostate('notFound', {
      notFound: { start: 'idle' }
    }))

    this.events = nanostate.parallel({
      loader: nanostate('off', {
        on: { 'off': 'off' },
        off: { 'on': 'on' }
      })
    })

    this.events.on('loader:on', () => {
      if (this.element) {
        this.rerender()
      }
    })

    this.events.on('loader:off', () => {
      this.loader.stop()
      if (this.element) {
        this.rerender()
      }
    })
  }

  createElement (props) {
    assert(Array.isArray(props.playlist), 'props.playlist must be an array')

    this._playlist = clone(props.playlist)
    this._type = props.type || 'default' // default | album
    this._style = props.style

    const playlist = {
      loading: {
        'on': this.renderLoader,
        'off': () => void 0
      }[this.events.state.loader](),
      error: this.renderError(),
      notFound: this.renderPlaceholder()
    }[this.machine.state] || this.renderPlaylist()

    return playlist
  }

  renderPlaylist () {
    const container = new ResponsiveContainer()
    const playlistItem = (item, index) => {
      const trackItem = new Track(`playlist-item-${item.track.id}`, this.state, this.emit)
      return trackItem.render({
        style: this._style,
        type: this._type,
        count: item.count,
        fav: item.fav,
        index: index + 1,
        src: item.url,
        track: item.track,
        trackGroup: item.track_group,
        playlist: this._playlist
      })
    }

    const el = html`
      <div class="flex flex-column flex-auto ph3 pt2 pb5">
        <ul class="flex flex-auto flex-column list ma0 pa0">
          ${this._playlist.map(playlistItem)}
        </ul>
      </div>
    `

    return container.render(el)
  }

  renderError () {
    return html`
      <div class="flex flex-column items-center justify-center">
        <p>Failed to fetch tracks</p>
        <div>
          <button onclick=${() => this.machine.emit('start')}>Try again</button>
        </div>
      </div>
    `
  }

  renderPlaceholder () {
    const message = {
      'owned': 'You don\'t own any tracks yet',
      'favorites': 'You don\'t have any favorites',
      'history': 'You haven\'t played any tracks yet'
    }[this.state.type] || 'No tracks to display'

    const template = {
      'tracks': renderMessage(message)
    }[this.type]

    return template

    function renderMessage (text, content) {
      return html`
        <div class="flex flex-column">
          <p class="tc">${text}</p>
          ${content}
        </div>
      `
    }
  }

  renderLoader () {
    const counter = renderCounter('playlist-loader', { scale: 3, strokeWidth: 1 })
    this.loader = new Loader(3, { animate: true, repeat: true, reach: 9, fps: 10 })
    this.loader.counter = counter

    return html`
      <div class="flex flex-column flex-auto items-center justify-center">
        ${this.loader.counter}
      </div>
    `
  }

  unload () {
    if (this.loader) {
      this.loader.stop()
    }
  }

  update (props) {
    return compare(this._playlist, props.playlist)
  }
}

module.exports = Playlist
