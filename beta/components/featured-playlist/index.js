/* global fetch */

const Component = require('choo/component')
const Playlist = require('@resonate/playlist-component')
const html = require('choo/html')

/**
 * Featured playlist (staff picks by default)
 */

class FeaturedPlaylist extends Component {
  constructor (id, state, emit) {
    super(id)

    this.local = state.components[id] = {}
    this.emit = emit
    this.state = state

    this.local.creator_id = 12788
    this.local.slug = 'staff-picks'

    this.local.tracks = []
  }

  createElement (props) {
    return html`
      <div class="bg-black white flex flex-column pt5 pt5-l pb4 ph0 ph4-ns">
        <h2 class="lh-title fw1 f4">Featured Playlist</h2>
        <div class="fl w-100 grow">
          <a class="db aspect-ratio aspect-ratio--110x26 bg-dark-gray bg-dark-gray--dark" href="/u/${this.local.creator_id}/playlist/${this.local.slug}">
            <div class="aspect-ratio--object cover" style="background:url(${this.local.cover}) center;"></div>
          </a>
        </div>
        <div class="flex flex-column flex-row-l flex-auto mt4">
          <div class="flex flex-column w-100 flex-auto pr5">
            <h3 class="ma0 f3 lh-title fw1">${this.local.title}</h3>
            <p>${this.local.about}</p>
          </div>
          <div class="flex flex-column w-100 flex-auto">
            ${this.state.cache(Playlist, 'playlist-featured-staff-picks').render({
              playlist: this.local.tracks
            })}
            <a href="/u/${this.local.creator_id}/playlist/${this.local.slug}" class="link">See all ${this.local.total} tracks</a>
          </div>
        </div>
      </div>
    `
  }

  async load () {
    const cid = 'playlist-featured-staff-picks'

    this.state.cache(Playlist, cid)

    const component = this.state.components[cid]

    const { machine, events } = component

    const loaderTimeout = setTimeout(() => {
      events.emit('loader:on')
    }, 300)

    machine.emit('start')

    try {
      const url = new URL('/v2/resolve', `https://${process.env.API_DOMAIN}`)
      // TODO get most recent community picks + history
      url.search = new URLSearchParams({
        url: `https://${process.env.APP_DOMAIN}/u/${this.local.creator_id}/playlist/${this.local.slug}`
      })
      let response = await (await fetch(url.href)).json()

      response = await this.state.apiv2.trackgroups.findOne({ id: response.data.id })

      if (response.data) {
        let counts = {}

        this.local.total = response.data.length
        this.local.cover = response.data.cover
        this.local.slug = response.data.slug
        this.local.creator_id = response.data.creator_id
        this.local.about = response.data.about
        this.local.title = response.data.title

        const items = response.data.items.slice(0, 4)

        if (this.state.user.uid) {
          response = await this.state.apiv2.plays.resolve({ ids: items.map(item => item.track.id) })

          counts = response.data.reduce((o, item) => {
            o[item.track_id] = item.count
            return o
          }, {})
        }

        this.local.tracks = items.map((item) => {
          return {
            count: counts[item.track.id] || 0,
            fav: 0,
            track_group: [
              {
                title: item.track.album,
                display_artist: item.track.artist
              }
            ],
            track: item.track,
            url: item.track.url || `https://api.resonate.is/v1/stream/${item.track.id}`
          }
        })

        machine.emit('resolve')
      }
    } catch (err) {
      machine.emit('reject')
      this.emit('error', err)
    } finally {
      clearTimeout(loaderTimeout)
      this.rerender()
    }
  }

  update (props) {
    return true
  }
}

module.exports = FeaturedPlaylist
