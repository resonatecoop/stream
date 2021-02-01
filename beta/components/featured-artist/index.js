/* global fetch */

const Component = require('choo/component')
const html = require('choo/html')
const button = require('@resonate/button')
const nanostate = require('nanostate')
const Playlist = require('@resonate/playlist-component')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
const adapter = require('@resonate/schemas/adapters/v1/track')

class FeaturedArtist extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state

    this.local = state.components[id] = {}

    this.local.data = []
    this.local.item = {}

    this.local.machine = nanostate.parallel({
      follow: nanostate('off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      })
    })

    this.local.machine.on('follow:toggle', () => {
      this.rerender()
    })
  }

  createElement (props = {}) {
    this.local.follow = props.follow || false // enable or diable follow feature, disabled by default

    const { images = {}, name, id } = this.local.item

    const cover = images['cover_photo-l'] || images['cover_photo-m'] || imagePlaceholder(600, 200)

    return html`
      <div class="bg-black white flex flex-column flex-row-ns items-start relative pt5 pt5-l pb4 ph0 ph4-ns">
        <div class="fl w-100 w-50-ns w-80-l grow">
          <a class="db aspect-ratio aspect-ratio--110x26 bg-dark-gray bg-dark-gray--dark" href="/artist/${id}">
            <div class="aspect-ratio--object cover bg-center" style="background-image:url(${cover})"></div>
          </a>
        </div>
        <div class="flex flex-column flex-auto items-start w-100 ph3 mt3 mt0-ns ml2-ns">
          <a href=${id ? `/artist/${id}` : ''} class="db w-100 link">
            <h3 class="flex flex-column flex-column-reverse f3 f2-l fw2 lh-title ma0 mb1">
              <span class="truncate">${name}</span>
              <small class="db f6 dark-gray fw1 lh-copy ttu">Featured Artist</small>
            </h3>
          </a>

          ${this.local.follow ? button({
            text: this.local.machine.state.follow === 'on' ? 'Unfollow' : 'Follow',
            style: 'none',
            prefix: 'bg-transparent f7 pv1 ph2 ttu b grow',
            outline: true,
            onClick: () => this.local.machine.emit('follow:toggle')
          }) : ''}

          <div class="flex flex-auto w-100">
            ${this.state.cache(Playlist, 'playlist-featured-artists').render({
              playlist: this.local.tracks || []
            })}
          </div>
        </div>
      </div>
    `
  }

  async load () {
    this.local.item = {}
    this.local.track = {}
    this.local.tracks = []

    this.rerender()

    const cid = 'playlist-featured-artists'

    let component = this.state.components[cid]

    if (!component) {
      this.state.cache(Playlist, cid)
      component = this.state.components[cid]
    }

    const { machine, events } = component

    if (machine.state.request === 'loading') {
      return
    }

    const loaderTimeout = setTimeout(() => {
      events.emit('loader:on')
    }, 300)

    machine.emit('start')

    try {
      let response = await (await fetch(`https://${process.env.API_DOMAIN}/api/v2/featured/artists`)).json()

      if (!response.data) {
        machine.emit('404')
      } else {
        this.local.item = response.data[Math.floor(Math.random() * response.data.length)]

        response = await this.state.api.artists.getTopTracks({ uid: this.local.item.id, limit: 1 })

        if (!response.data) {
          machine.emit('404')
        } else {
          machine.emit('resolve')

          this.local.tracks = response.data.map(adapter)

          if (!this.state.tracks.length) {
            this.state.tracks = this.local.tracks

            this.emit(this.state.events.RENDER)
          }
        }
      }
    } catch (err) {
      machine.emit('reject')
      this.emit('error', err)
    } finally {
      events.state.loader === 'on' && events.emit('loader:off')
      clearTimeout(loaderTimeout)
      this.rerender()
    }
  }

  update (props) {
    if (props.uid !== this.local.uid && this.local.tracks.length) {
      this.local.uid = props.uid
      this.state.apiv2.plays.resolve({
        ids: this.local.tracks.map(item => item.track.id)
      }).then(response => {
        if (response.data) {
          const counts = response.data.reduce((o, item) => {
            o[item.track_id] = item.count
            return o
          }, {})

          this.local.tracks = this.local.tracks.map((item) => {
            return Object.assign({}, item, { count: counts[item.track.id] })
          })

          this.rerender()
        }
      }).catch((err) => {
        this.emit('error', err)
      })
    }
    return false
  }
}

module.exports = FeaturedArtist
