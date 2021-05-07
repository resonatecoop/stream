const assert = require('assert')
const html = require('nanohtml')
const Component = require('nanocomponent')
const compare = require('nanocomponent/compare')
const nanostate = require('nanostate')
const clone = require('shallow-clone')
const Loader = require('@resonate/play-count-component')
const { isNode } = require('browser-or-node')
const Track = require('@resonate/track-component')
const ResponsiveContainer = require('resize-observer-component')
const icon = require('@resonate/icon-element')
const { iconFill } = require('@resonate/theme-skins')

/*
 * Component for listing tracks (generally 50 tracks max)
 */

class Playlist extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state

    this.local = state.components[id] = Object.create({
      machine: nanostate(isNode ? 'data' : 'idle', {
        idle: { start: 'loading', reject: 'error' },
        loading: { resolve: 'data', reject: 'error' },
        data: { start: 'loading' },
        error: { start: 'loading' }
      }),
      events: nanostate.parallel({
        loader: nanostate('off', {
          on: { toggle: 'off' },
          off: { toggle: 'on' }
        })
      })
    })

    this.local.machine.event('404', nanostate('404', {
      404: { start: 'loading' }
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

    this.local.events.on('loader:toggle', () => {
      if (this.element) this.rerender()
    })
  }

  createElement (props) {
    assert(Array.isArray(props.playlist), 'props.playlist must be an array')

    this.local.playlist = clone(props.playlist)
    this.local.various = props.various || false
    this.local.hideMenu = props.hideMenu || false
    this.local.hideCount = props.hideCount || false
    this.local.type = props.type || 'default' // default | album

    const machine = {
      idle: () => {},
      loading: {
        on: () => {
          const loader = new Loader('loader', this.state, this.emit).render({
            count: 3,
            options: { animate: true, repeat: true, reach: 9, fps: 10 }
          })

          return html`
            <div class="flex flex-column flex-auto items-center justify-center">
              ${loader}
            </div>
          `
        },
        off: () => {}
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
      },
      data: () => {
        const container = new ResponsiveContainer()

        return container.render(html`
          <ul class="playlist flex flex-auto flex-column list ma0 pa0">
            ${this.local.playlist.map((item, index) => {
              const cid = `${this._name}-track-item-${item.track.id}`
              const trackItem = new Track(cid, this.state, this.emit)

              return trackItem.render({
                type: this.local.type,
                showArtist: this.local.type !== 'album' ? true : !!this.local.various,
                hideMenu: this.local.hideMenu,
                hideCount: this.local.hideCount,
                count: item.count,
                fav: item.fav,
                favorite: item.favorite,
                index: index + 1,
                src: item.url,
                track: item.track,
                trackGroup: item.track_group,
                playlist: this.local.playlist
              })
            })}
          </ul>
        `)
      }
    }[this.local.machine.state]

    return html`<div class="flex flex-column flex-auto h-100 pt2 pb5">${machine()}</div>`
  }

  update (props) {
    assert(Array.isArray(props.playlist), 'props.playlist must be an array')
    return compare(this.local.playlist, props.playlist)
  }
}

module.exports = Playlist
