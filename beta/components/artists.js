const Nanocomponent = require('choo/component')
const compare = require('nanocomponent/compare')
const html = require('choo/html')
const clone = require('shallow-clone')
const Artist = require('./artist')
const nanostate = require('nanostate')
const nanologger = require('nanologger')
const Loader = require('./play-count')
const morph = require('nanomorph')
const { foreground: fg } = require('@resonate/theme-skins')

const apiFactoryGenerator = require('@resonate/api-factory-generator')
const range = (start, end, step = 1) => {
  const allNumbers = [start, end, step].every(Number.isFinite)

  if (!allNumbers) {
    throw new TypeError('range() expects only finite numbers as arguments.')
  }

  if (step <= 0) {
    throw new Error('step must be a number greater than 0.')
  }

  if (start > end) {
    step = -step
  }

  const length = Math.floor(Math.abs((end - start) / step)) + 1

  return Array.from(Array(length), (x, index) => start + index * step)
}

const api = apiFactoryGenerator({
  artists: {
    find: {
      path: '/artists',
      schema: {
        type: 'object',
        properties: {
          page: {
            type: 'number'
          },
          limit: {
            type: 'number'
          },
          order: {
            type: 'string',
            enum: ['desc', 'asc']
          },
          order_by: {
            type: 'string',
            enum: ['name', 'id']
          }
        }
      }
    }
  }
}, {
  scheme: 'https://',
  domain: process.env.API_DOMAIN || 'api.resonate.localhost',
  prefix: '/v1',
  version: 1
})

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
    this.renderPagination = this.renderPagination.bind(this)
    this.loadArtists = this.loadArtists.bind(this)

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
      this.log.info('loader:toggle', this.loader.state.loader)
      if (this.element) this.rerender()
    })

    this.machine.on('notFound', () => {
      this.log.info('notFound')
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

    this.page = this.page.bind(this)
    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)

    this.currentPage = 1
    this.prevPage = 0
    this.nextPage = 2
  }

  createElement (props = {}) {
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

    return html`
      <div class="flex flex-column flex-auto w-100">
        ${artists}
        ${paginationEnabled ? this.renderPagination() : ''}
      </div>
    `
  }

  page (pageNumber) {
    this.nextPage = pageNumber + 1
    this.currentPage = pageNumber
    this.prevPage = pageNumber - 1
    morph(this.element.querySelector('.pagination'), this.renderPagination())

    this.emit(this.state.events.PUSHSTATE, `/artists?page=${this.currentPage}`)

    this.loadArtists()
  }

  prev () {
    if (this.prevPage === 0) return
    this.nextPage = this.currentPage
    this.currentPage = this.currentPage - 1
    this.prevPage = this.currentPage - 1
    morph(this.element.querySelector('.pagination'), this.renderPagination())

    this.emit(this.state.events.PUSHSTATE, `/artists?page=${this.currentPage}`)

    this.loadArtists()
  }

  next () {
    this.prevPage = this.currentPage
    this.currentPage = this.currentPage + 1
    this.nextPage = this.currentPage + 1
    morph(this.element.querySelector('.pagination'), this.renderPagination())
    this.emit(this.state.events.PUSHSTATE, `/artists?page=${this.currentPage}`)

    this.loadArtists()
  }

  renderPagination () {
    const paginationItem = (pageNumber) => {
      const handleClick = (e) => {
        e.preventDefault()
        this.page(pageNumber)
      }
      const isActive = this.currentPage === pageNumber
      return html`
        <li class="mh2">
          <a href="/artists?page=${pageNumber}" onclick=${handleClick} class="link dim pa2 ${isActive ? 'b' : ''}" title="Go to page ${pageNumber}">
            ${pageNumber}
          </a>
        </li>
      `
    }

    const handlePrev = (e) => {
      e.preventDefault()
      this.prev()
    }

    const handleNext = (e) => {
      e.preventDefault()
      this.next()
    }

    return html`
      <div class="pagination flex items-center justify-center mv4">
        <a href="/artists?page=${this.prevPage}" onclick=${handlePrev} class="${fg} ${this.prevPage < 1 ? 'o-20' : 'grow'} link ph3 pv2 mh2" style="cursor:${this.prevPage < 1 ? 'not-allowed' : 'pointer'}">Prev</a>
        <ul class="list ma0 pa0 flex justify-between">
          ${this.currentPage > 4 ? html`<div class="flex">${range(1, 1).map(paginationItem)}<span class="ph3">...</span></div>` : ''}
          ${this.currentPage === 2 ? range(this.currentPage - 1, this.currentPage - 1).map(paginationItem) : ''}
          ${this.currentPage === 3 ? range(this.currentPage - 2, this.currentPage - 1).map(paginationItem) : ''}
          ${this.currentPage >= 4 ? range(this.currentPage - 3, this.currentPage - 1).map(paginationItem) : ''}
          ${range(this.currentPage, this.currentPage + 4).map(paginationItem)}
          ${this.currentPage < 25 ? html`<div class="flex"><span class="ph3">...</span></div>${range(50, 50).map(paginationItem)}` : ''}
        </ul>
        <a href="/artists?page=${this.nextPage}" onclick=${handleNext} class="${fg} link ph3 pv2 mh2 grow">Next</a>
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

  async loadArtists () {
    try {
      const page = this.currentPage - 1
      const response = await api.artists.find({ page, limit: 20, order: 'desc', order_by: 'id' })

      this.items = response.data

      morph(this.element.querySelector('.artists'), this.renderArtists())
    } catch (err) {
      this.log.error(err)
    }
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

  load () {
    if (this.state.route === 'artists') {
      this.loadArtists()
    }

    morph(this.element.querySelector('.pagination'), this.renderPagination())
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
