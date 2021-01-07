/* global fetch */

const Component = require('choo/component')
const html = require('choo/html')
const clone = require('shallow-clone')
const button = require('@resonate/button')
const nanostate = require('nanostate')
const Playlist = require('@resonate/playlist-component')
const { isBrowser } = require('browser-or-node')

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
    this.local.data = clone(props.data)

    if (isBrowser && !this.local.item.track_id) {
      this.local.item = this.local.data[Math.floor(Math.random() * this.local.data.length)] // get random item from array of artists
    }

    this.local.follow = props.follow || false // enable or diable follow feature, disabled by default

    const { track_id: tid, display_name: displayName = '', creator_id: creatorId, cover, coverOrientation } = this.local.item
    const id = creatorId

    return html`
      <div class="bg-black white flex flex-column flex-row-ns items-start relative pt5 pt5-l pb4 ph0 ph4-ns">
        <div class="fl w-100 w-50-ns w-80-l grow">
          <a class="db aspect-ratio aspect-ratio--16x9 bg-dark-gray bg-dark-gray--dark" href="/artist/${id}">
            <div class="aspect-ratio--object cover" style="background:url(${cover}) ${coverOrientation || 'center'};"></div>
          </a>
        </div>
        <div class="flex flex-auto w-100 ph3 mt3 mt0-ns items-start flex-column ml2">
          <a href=${id ? `/artist/${id}` : ''} class="link">
            <h3 class="ma0 mb1">
              <small class="db f6 dark-gray fw1 lh-copy ttu">Featured Artist</small>
              <span class="f2 fw2 lh-title">${displayName}</span>
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
            ${this.state.cache(Playlist, `playlist-track-${tid}`).render({
              playlist: this.local.tracks || []
            })}
          </div>
        </div>
      </div>
    `
  }

  async load () {
    const { track_id: tid } = this.local.item

    const cid = `playlist-track-${tid}`

    this.state.cache(Playlist, cid)

    const component = this.state.components[cid]

    const { machine, events } = component

    const loaderTimeout = setTimeout(() => {
      events.emit('loader:on')
    }, 300)

    machine.emit('start')

    try {
      let response = await (await fetch(`https://${process.env.API_DOMAIN}/v2/tracks/${tid}`)).json()

      if (response.data) {
        this.local.track = response.data

        let counts = {}

        if (this.state.user.uid) {
          response = await this.state.apiv2.plays.resolve({ ids: [tid] })

          counts = response.data.reduce((o, item) => {
            o[item.track_id] = item.count
            return o
          }, {})
        }

        machine.emit('resolve')

        this.local.tracks = [
          {
            count: counts[tid] || 0,
            fav: 0,
            track_group: [
              {
                title: this.local.track.album,
                display_artist: this.local.track.display_artist
              }
            ],
            track: this.local.track,
            url: this.local.track.url || `https://${process.env.API_DOMAIN}/v1/stream/${tid}`
          }
        ]

        if (!this.state.tracks.length) {
          this.state.tracks = this.local.tracks

          this.emit(this.state.events.RENDER)
        }
      } else {
        machine.emit('notFound')
      }
    } catch (err) {
      machine.emit('reject')
      this.emit('error', err)
    } finally {
      clearTimeout(loaderTimeout)
      this.rerender()
    }
  }

  update () {
    return false
  }
}

module.exports = FeaturedArtist
