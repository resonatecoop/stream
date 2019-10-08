const Component = require('choo/component')
const compare = require('nanocomponent/compare')
const html = require('choo/html')
const Loader = require('@resonate/play-count-component')
const Playlist = require('@resonate/playlist-component')
const Pagination = require('@resonate/pagination')
const adapter = require('@resonate/schemas/adapters/v1/track')
const nanostate = require('nanostate')
const nanologger = require('nanologger')
const clock = require('mm-ss')
const clone = require('shallow-clone')

/*
 * Render a list of albums as playlists
 */

class Albums extends Component {
  constructor (id, state, emit) {
    super(id)

    this.id = id
    this.state = state
    this.emit = emit

    this.items = []

    this.renderAlbums = this.renderAlbums.bind(this)

    this.log = nanologger(id)

    this.machine = nanostate('idle', {
      idle: { start: 'loading', resolve: 'data' },
      loading: { resolve: 'data', reject: 'error', reset: 'idle' },
      data: { start: 'loading', reset: 'idle' },
      error: { start: 'loading', reset: 'idle' }
    })

    this.machine.event('404', nanostate('404', {
      404: { start: 'idle' }
    }))

    this.loader = nanostate.parallel({
      loader: nanostate('off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      })
    })

    this.loader.on('loader:toggle', () => {
      this.log.info('loader:toggle', this.loader.state.loader)
      if (this.element) this.rerender()
    })

    this.machine.on('404', () => {
      if (this.element) this.rerender()
    })

    this.machine.on('loading', () => {
      this.log.info('loading')
    })

    this.machine.on('error', () => {
      this.log.error('error')
      if (this.element) this.rerender()
    })

    this.machine.on('data', () => {
      this.log.info('data')
      if (this.element) this.rerender()
    })
  }

  createElement (props) {
    const state = this.state
    const emit = this.emit

    const { items = [], numberOfPages = 1, pagination: paginationEnabled = true } = props

    this.items = clone(items)

    const albums = {
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
        },
        off: () => {}
      }[this.loader.state.loader](),
      404: () => {
        return html`
          <div class="flex flex-column flex-auto w-100 items-center justify-center">
            <p class="tc">This label has no albums yet</p>
          </div>
        `
      },
      error: () => {
        return html`
          <div class="flex flex-column flex-auto w-100 items-center justify-center">
            <p>Failed to fetch albums</p>
          </div>
        `
      }
    }[this.machine.state] || this.renderAlbums()

    let paginationEl

    if (paginationEnabled && numberOfPages > 1) {
      paginationEl = new Pagination(this.id + '-pagination', state, emit).render({
        navigate: function (pageNumber) {
          const path = !/albums/.test(state.href) ? '/albums' : ''
          emit(state.events.PUSHSTATE, state.href + `${path}?page=${pageNumber}`)
        },
        path: !/albums/.test(state.href) ? '/albums' : '',
        numberOfPages
      })
    }

    return html`
      <div class="flex flex-column flex-auto w-100">
        ${albums}
        ${paginationEl}
      </div>
    `
  }

  renderAlbums () {
    const albumItem = (album, index) => {
      const playlist = this.state.cache(Playlist, `${this.id}-album-playlist-${index}`).render({
        type: 'album',
        various: album.various,
        playlist: album.tracks.length ? album.tracks.map(adapter) : []
      })

      const src = album.tracks.length ? album.tracks[0].artwork.large : ''

      return html`
        <article class="mb6 flex flex-column flex-row-l flex-auto">
          <div class="flex flex-column mw5-m mw5-l mb2 w-100">
            <div class="db aspect-ratio aspect-ratio--1x1">
              <span role="img" style="background:url(${src}) no-repeat;" class="bg-center cover aspect-ratio--object z-1">
              </span>
            </div>
          </div>
          <div class="flex flex-column flex-auto pl2-l">
            <header>
              <div class="flex flex-column">
                <h3 class="ma0 lh-title f4 normal">
                  ${album.name}
                </h3>
                <div>
                  ${!album.various ? html`<a href="/artists/${album.uid}" class="link dark-gray">${album.artist}</a>` : html`<span>${album.artist}</span>`}
                </div>
              </div>
            </header>
            ${playlist}
            <div class="flex flex-column pr2 mb2">
              <dl class="flex">
                <dt class="flex-auto w-100 ma0">Running time</dt>
                <dd class="flex-auto w-100 ma0 dark-gray">
                  ${clock(album.duration)}
                </dd>
              </dl>
            </div>
          </div>
        </article>
      `
    }

    return html`
      <ul class="list ma0 pa0">
        ${this.items.map(albumItem)}
      </ul>
    `
  }

  unload () {
    if (this.machine.state !== 'idle') {
      this.machine.emit('reset')
    }
  }

  update (props) {
    return compare(this.items, props.items)
  }
}

module.exports = Albums
