/* global fetch */

const Component = require('choo/component')
const Grid = require('../grid')
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

    this.local.covers = []
    this.local.user = {}
    this.local.creator_id = 12788
    this.local.slug = 'staff-picks'

    this.local.tracks = []
  }

  createElement (props) {
    const kind = {
      'label-owner': 'label',
      bands: 'artist',
      member: 'artist'
    }[this.local.user.role] || 'u'

    return html`
      <div class="flex flex-column pt5 pt5-l pb4 ph0 ph4-ns">
        <h2 class="lh-title fw1 f4">Featured Playlist</h2>
        <div class="flex flex-column flex-auto w-100 flex-row-l">
          <div class="flex flex-column flex-auto w-100">
            <a href="/u/${this.local.creator_id}/playlist/${this.local.slug}">
              ${this.state.cache(Grid, 'featured-playlist-cover-grid').render({ items: this.local.covers })}
            </a>
          </div>
          <div class="flex flex-column items-start justify-start flex-auto w-100">
            <div class="flex flex-column w-100 pr5 mt3 ph3 mt0-l pr0-l ph4-l">
              <h3 class="ma0 f3 lh-title fw1">
                <a href="/u/${this.local.creator_id}/playlist/${this.local.slug}" class="link">${this.local.title}</a>
              </h3>
              <div>
                <a href="/${kind}/${this.local.user.id}" class="link f5">${this.local.user.name}</a>
              </div>
              <p class="measure f5 lh-copy">${this.local.about}</p>
            </div>
            <div class="flex flex-column w-100 flex-auto ph3 pr0-l pl4-l flex-basis-0-l">
              <div class="flex flex-column pa3 bg-light-gray bg-light-gray--light bg-near-black--dark h-100 overflow-auto">
                <div class="cf">
                  ${this.state.cache(Playlist, 'playlist-featured-staff-picks').render({
                    playlist: this.local.tracks
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  async load () {
    const cid = 'playlist-featured-staff-picks'

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
        this.local.user = response.data.user
        this.local.covers = response.data.items
          .map(({ track }) => track.cover)
          .sort(() => 0.5 - Math.random())
          .slice(0, 13)

        const items = response.data.items

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
            url: item.track.url || `https://${process.env.API_DOMAIN}/v1/stream/${item.track.id}`
          }
        })

        machine.emit('resolve')
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
    return true
  }
}

module.exports = FeaturedPlaylist
