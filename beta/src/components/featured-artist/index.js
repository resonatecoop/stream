/* global fetch */

const Component = require('choo/component')
const html = require('choo/html')
const button = require('@resonate/button')
const nanostate = require('nanostate')
const Playlist = require('@resonate/playlist-component')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
const adapter = require('@resonate/schemas/adapters/v1/track')
const setLoaderTimeout = require('../../lib/loader-timeout')
const resolvePlaysAndFavorites = require('../../lib/resolve-plays-favorites')
const { getAPIServiceClient } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST,
  base: process.env.API_BASE || '/api/v3'
})

class FeaturedArtist extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state

    this.local = state.components[id] = {}

    this.local.data = []
    this.local.item = {}
    this.local.tracks = []

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

          ${this.local.follow
            ? button({
                text: this.local.machine.state.follow === 'on' ? 'Unfollow' : 'Follow',
                style: 'none',
                prefix: 'bg-transparent f7 pv1 ph2 ttu b grow',
                outline: true,
                onClick: () => this.local.machine.emit('follow:toggle')
              })
            : ''}

          <div class="flex flex-auto w-100">
            ${this.state.cache(Playlist, 'playlist-featured-artists').render({
              playlist: this.local.tracks || []
            })}
          </div>
        </div>
      </div>
    `
  }

  load () {
    this.local.item = {}
    this.local.tracks = []

    this.rerender()

    this.fetch()
  }

  async fetch () {
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

    const loaderTimeout = setLoaderTimeout(machine)

    machine.emit('start')

    try {
      if (!this.local.data.length) {
        const response = await (await fetch(`https://${process.env.API_DOMAIN}/api/v2/featured/artists`)).json()

        if (!response.data) {
          machine.emit('404')
        }

        this.local.data = response.data
      }

      this.local.item = this.local.data[Math.floor(Math.random() * this.local.data.length)]

      this.rerender()

      const client = await getAPIServiceClient('artists')
      const result = await client.getArtistTopTracks({ id: this.local.item.id, limit: 1 })
      const { body: response } = result
      const { data, status } = response

      if (status === 404) {
        machine.emit('404')
      } else if (data) {
        machine.emit('resolve')

        this.local.tracks = data.map(adapter)

        if (!this.state.tracks.length) {
          this.state.tracks = this.local.tracks

          this.emit(this.state.events.RENDER)
        }
      }
    } catch (err) {
      machine.emit('reject')
      this.emit('error', err)
    } finally {
      events.state.loader === 'on' && events.emit('loader:toggle')
      clearTimeout(await loaderTimeout)
      if (this.element) this.rerender()
    }
  }

  async update (props) {
    if (props.uid && props.uid !== this.local.uid && this.local.tracks.length) {
      this.local.uid = props.uid

      try {
        const ids = this.local.tracks.map(item => item.track.id)
        const [counts, favorites] = await resolvePlaysAndFavorites(ids)(this.state)

        this.local.tracks = this.local.tracks.map((item) => {
          return Object.assign({}, item, {
            count: counts[item.track.id],
            favorite: !!favorites[item.track.id]
          })
        })

        this.rerender()
      } catch (err) {
        console.log(err)
      }
    }
    return false
  }
}

module.exports = FeaturedArtist
