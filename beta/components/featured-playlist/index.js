const Component = require('choo/component')
const Grid = require('../grid')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
const Playlist = require('@resonate/playlist-component')
const html = require('choo/html')
const LoaderTimeout = require('../../lib/loader-timeout')
const resolvePlaysAndFavorites = require('../../lib/resolve-plays-favorites')
const { getAPIServiceClient } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST
})

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
    this.local.creator_id = 12788 // id to use to fetch upload account playlists

    this.local.tracks = []
  }

  createElement (props) {
    const kind = {
      'label-owner': 'label',
      bands: 'artist',
      member: 'artist'
    }[this.local.user.role] || 'u'

    const coverSrc = this.local.cover || imagePlaceholder(600, 600)

    return html`
      <div class="flex flex-column pt5 pt5-l pb4 ph0 ph4-ns">
        <h2 class="lh-title fw1 f4 ml3 ml0-ns">Featured Playlist</h2>
        <div class="flex flex-column flex-auto w-100 flex-row-l">
          <div class="flex flex-column flex-auto w-100">
            <div class="sticky top-3">
              <a href="/u/${this.local.creator_id}/playlist/${this.local.slug}">
                ${this.local.covers.length >= 13
                  ? this.state.cache(Grid, 'featured-playlist-cover-grid').render({
                    items: this.local.covers
                  })
                  : html`
                    <article class="cf">
                      <div class="fl w-100">
                        <div class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray bg-dark-gray--dark dim">
                          <span role="img" class="aspect-ratio--object bg-center cover" style="background-image:url(${coverSrc});"></span>
                        </div>
                      </div>
                    </article>
                  `}
              </a>
            </div>
          </div>
          <div class="flex flex-column items-start justify-start flex-auto w-100 ph3 ph0-ns">
            <div class="flex flex-column w-100 pr5 mt3 mt0-l pr0-l ph4-l">
              <h3 class="ma0 f3 lh-title fw1">
                <a href="/u/${this.local.creator_id}/playlist/${this.local.slug}" class="link">
                  ${this.local.title}
                </a>
              </h3>
              <div>
                <a href="/${kind}/${this.local.user.id}" class="link f5">${this.local.user.name}</a>
              </div>
            </div>
            <div class="flex flex-column w-100 flex-auto pr0-l pl4-l">
              <div class="playlist flex flex-column h-100">
                ${this.state.cache(Playlist, 'playlist-featured-staff-picks').render({
                  playlist: this.local.tracks
                })}
              </div>
              <div class="flex flex-column flex-auto">
                <p class="measure f5 lh-copy">${this.local.about}</p>
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

    const loaderTimeout = LoaderTimeout(events)

    try {
      machine.emit('start')

      const client = await getAPIServiceClient('users')
      const result = await client.getUserPlaylists({
        id: this.local.creator_id // uploader account
      })

      const { body: response } = result
      const { data: playlistData, status } = response

      if (status !== 'ok' || !Array.isArray(playlistData)) {
        component.error = response
        return machine.emit('request:error')
      }

      if (playlistData) {
        const client = await getAPIServiceClient('trackgroups')
        const result = await client.getTrackgroup({
          id: playlistData[0].id // first playlist id
        })
        const { body: response } = result

        if (response.data) {
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

          machine.emit('resolve')

          this.local.tracks = items.map((item) => {
            return {
              count: 0,
              favorite: false,
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

          if (this.element) this.rerender()

          if (this.state.user.uid) {
            const ids = items.map(item => item.track.id)

            const [counts, favorites] = await resolvePlaysAndFavorites(ids)(this.state)

            this.local.tracks = items.map((item) => {
              return Object.assign({}, item, {
                count: counts[item.track.id] || 0,
                favorite: !!favorites[item.track.id]
              })
            })
          }
        }
      } else {
        machine.emit('404')
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

      const ids = this.local.tracks.map(item => item.track.id)

      try {
        const [counts, favorites] = await resolvePlaysAndFavorites(ids)(this.state)

        this.local.tracks = this.local.tracks.map((item) => {
          return Object.assign({}, item, {
            count: counts[item.track.id],
            fav: favorites[item.track.id] ? 1 : 0,
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

module.exports = FeaturedPlaylist
