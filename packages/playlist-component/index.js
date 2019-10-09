const assert = require('assert')
const html = require('nanohtml')
const Component = require('nanocomponent')
const compare = require('nanocomponent/compare')
const nanostate = require('nanostate')
const clone = require('shallow-clone')
const Loader = require('@resonate/play-count-component')
const Track = require('@resonate/track-component')
const Pagination = require('@resonate/pagination')
const ResponsiveContainer = require('resize-observer-component')
const icon = require('@resonate/icon-element')
const { iconFill } = require('@resonate/theme-skins')

/*
 * Component for interacting with tracks
 */

class Playlist extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state

    this.local = state.components[id] = Object.create({
      machine: nanostate('idle', {
        idle: { start: 'loading' },
        loading: { resolve: 'data', reject: 'error', reset: 'idle' },
        data: { reset: 'idle', start: 'loading' },
        error: { reset: 'idle', start: 'loading' }
      }),
      events: nanostate.parallel({
        loader: nanostate('off', {
          on: { off: 'off' },
          off: { on: 'on' }
        })
      })
    })

    this.local.machine.event('404', nanostate('404', {
      404: { reset: 'idle', start: 'loading' }
    }))

    this.local.machine.on('error', () => {
      if (this.element) {
        this.rerender()
      }
    })

    this.local.machine.on('404', () => {
      if (this.element) {
        this.rerender()
      }
    })

    this.local.events.on('loader:on', () => {
      if (this.element) {
        this.rerender()
      }
    })

    this.local.events.on('loader:off', () => {
      if (this.element) {
        this.rerender()
      }
    })
  }

  createElement (props) {
    assert(Array.isArray(props.playlist), 'props.playlist must be an array')

    const state = this.state
    const emit = this.emit

    const { pagination: paginationEnabled, playlist: items } = props

    this.local.playlist = clone(items)
    this.local.various = props.various || false
    this.local.type = props.type || 'default' // default | album

    const numberOfPages = props.numberOfPages || 1

    const machine = {
      loading: {
        on: () => {
          const loader = new Loader('loader', state, emit).render({
            count: 3,
            options: { animate: true, repeat: true, reach: 9, fps: 10 }
          })

          return html`
            <div class="flex flex-column flex-auto items-center justify-center">
              ${loader}
            </div>
          `
        }
      }[this.local.events.state.loader],
      error: () => {
        return html`
          <div class="flex flex-auto w-100 items-center justify-center">
            ${icon('info', { size: 'sm', class: 'fill-red' })}
            <p class="ma0 pl3">Failed to fetch tracks</p>
          </div>
        `
      },
      404: () => {
        const message = {
          owned: 'You don\'t own any tracks yet',
          favorites: 'You don\'t have any favorites',
          history: 'You haven\'t played any tracks yet'
        }[this.local.type] || 'No tracks to display'

        return html`
          <div class="flex flex-auto w-100 items-center justify-center">
            ${icon('info', { size: 'sm', class: iconFill })}
            <p class="ma0 pl3">${message}</p>
          </div>
        `
      }
    }[this.local.machine.state]

    if (typeof machine === 'function') return machine()

    const showPagination = paginationEnabled && numberOfPages > 1

    const paginationEl = showPagination ? new Pagination([this._name, 'pagination'].join('-'), state, emit).render({
      navigate: function (pageNumber) {
        emit(state.events.PUSHSTATE, state.href + `?page=${pageNumber}`)
      },
      numberOfPages
    }) : ''

    const container = new ResponsiveContainer()

    return container.render(html`
      <div class="flex flex-column flex-auto pt2 pb5">
        <ul class="playlist flex flex-auto flex-column list ma0 pa0">
          ${this.local.playlist.map((item, index) => {
            const trackItem = new Track(`${this._name}-track-item-${item.track.id}`, state, emit)

            return trackItem.render({
              type: this.local.type,
              showArtist: this.local.type !== 'album' ? true : !!this.local.various,
              count: item.count,
              fav: item.fav,
              index: index + 1,
              src: item.url,
              track: item.track,
              trackGroup: item.track_group,
              playlist: this.local.playlist
            })
          })}
        </ul>
        ${paginationEl}
      </div>
    `)
  }

  unload () {
    if (this.local.machine.state !== 'idle') {
      this.local.machine.emit('reset')
    }
  }

  update (props) {
    return compare(this.local.playlist, props.playlist)
  }
}

module.exports = Playlist
