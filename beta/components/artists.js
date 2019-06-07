const Nanocomponent = require('choo/component')
const compare = require('nanocomponent/compare')
const html = require('choo/html')
const clone = require('shallow-clone')
const Artist = require('./artist')
const nanostate = require('nanostate')
const nanologger = require('nanologger')
const Loader = require('./play-count')
const Pagination = require('@resonate/pagination')

class Artists extends Nanocomponent {
  constructor (name, state, emit) {
    super(name)

    this.items = []

    this.state = state
    this.emit = emit

    this.log = nanologger(name)

    this.renderArtists = this.renderArtists.bind(this)
    this.renderError = this.renderError.bind(this)
    this.renderPlaceholder = this.renderPlaceholder.bind(this)

    this.machine = nanostate('idle', {
      idle: { 'start': 'loading', 'resolve': 'data' },
      loading: { 'resolve': 'data', reject: 'error' },
      data: { 'start': 'idle', 'resolve': 'data' },
      error: { 'start': 'idle' }
    })

    this.machine.event('notFound', nanostate('notFound', {
      notFound: { start: 'idle' }
    }))

    this.loader = nanostate.parallel({
      loader: nanostate('off', {
        on: { 'toggle': 'off' },
        off: { 'toggle': 'on' }
      })
    })

    this.loader.on('loader:toggle', () => {
      if (this.element) this.rerender()
    })

    this.machine.on('notFound', () => {
      if (this.element) this.rerender()
    })

    this.machine.on('error', () => {
      if (this.element) this.rerender()
    })

    this.machine.on('data', () => {
      if (this.element) this.rerender()
    })

    this.currentPage = 1
  }

  createElement (props = {}) {
    const self = this
    const { items = [], shuffle = false, pagination: paginationEnabled = true } = props

    this.items = clone(items)

    if (shuffle) {
      this.items = this.items.sort(() => Math.random() - 0.5)
    }

    const artists = {
      loading: {
        'on': this.renderLoader,
        'off': () => void 0
      }[this.loader.state.loader](),
      notFound: this.renderPlaceholder(),
      error: this.renderError()
    }[this.machine.state] || this.renderArtists()

    let paginationEl

    if (paginationEnabled) {
      paginationEl = new Pagination('artists-pagination', this.state, this.emit).render({
        navigate: function (pageNumber) {
          self.emit(self.state.events.PUSHSTATE, self.state.href + `?page=${pageNumber}`)
        }
      })
    }

    return html`
      <div class="flex flex-column flex-auto w-100">
        ${artists}
        ${paginationEl}
      </div>
    `
  }

  renderArtists () {
    const items = this.items.map(({ avatar, id, name }) => {
      const artist = new Artist(id, this.state, this.emit)
      return artist.render({ avatar, id, name })
    })
    return html`
      <ul class="artists list ma0 pa0 cf">
        ${items}
      </ul>
    `
  }

  beforerender () {
    if (this.state.query) {
      let pageNumber = Number(this.state.query.page)
      if (Number.isFinite(pageNumber)) {
        this.currentPage = pageNumber
        this.prevPage = this.currentPage - 1
        this.nextPage = this.currentPage + 1
      }
    }
  }

  renderError () {
    return html`
      <div class="flex flex-column flex-auto w-100 items-center justify-center">
        <p>Failed to fetch artists</p>
        <div>
          <button onclick=${() => {
    this.emit('labels:reload', this.state.params.id)
  }}>Try again</button>
        </div>
      </div>
    `
  }

  renderPlaceholder () {
    return html`
      <div class="flex flex-column flex-auto w-100 items-center justify-center">
        <p class="tc">👽 No artists found</p>
      </div>
    `
  }

  renderLoader () {
    const loader = new Loader()
    return html`
      <div class="flex flex-column flex-auto items-center justify-center">
        ${loader.render({
    name: 'loader',
    count: 3,
    options: { animate: true, repeat: true, reach: 9, fps: 10 }
  })}
      </div>
    `
  }

  update (props) {
    if (props) {
      return compare(props.items, this.items)
    }
    return false
  }
}

module.exports = Artists
