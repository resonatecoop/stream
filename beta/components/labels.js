const Nanocomponent = require('nanocomponent')
const compare = require('nanocomponent/compare')
const html = require('choo/html')
const clone = require('shallow-clone')
const Label = require('./label')
const nanostate = require('nanostate')
const nanologger = require('nanologger')
const Loader = require('./play-count')
const Pagination = require('@resonate/pagination')

class Labels extends Nanocomponent {
  constructor (name, state, emit) {
    super(name)

    this.state = state
    this.emit = emit

    this.log = nanologger(name)

    this.items = []

    this.renderLabels = this.renderLabels.bind(this)
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
  }

  createElement (props = {}) {
    const self = this
    const { items = [], pagination: paginationEnabled = true } = props

    this.items = clone(items)

    const labels = {
      loading: {
        'on': this.renderLoader,
        'off': () => void 0
      }[this.loader.state.loader](),
      notFound: this.renderPlaceholder(),
      error: this.renderError()
    }[this.machine.state] || this.renderLabels()

    let paginationEl

    if (paginationEnabled) {
      paginationEl = new Pagination('labels-pagination', this.state, this.emit).render({
        navigate: function (pageNumber) {
          self.emit(self.state.events.PUSHSTATE, self.state.href + `?page=${pageNumber}`)
        }
      })
    }

    return html`
      <div class="flex flex-column flex-auto w-100">
        ${labels}
        ${paginationEl}
      </div>
    `
  }

  renderLabels () {
    const items = this.items.map(({ avatar, id, name }) => {
      const label = new Label(id, this.state, this.emit)
      return label.render({ avatar, id, name })
    })
    return html`
      <ul class="labels list ma0 pa0 cf">
        ${items}
      </ul>
    `
  }

  renderError () {
    return html`
      <div class="flex flex-column flex-auto w-100 items-center justify-center">
        <p>Failed to fetch labels</p>
      </div>
    `
  }

  renderPlaceholder () {
    return html`
      <div class="flex flex-column flex-auto w-100 items-center justify-center">
        <p class="tc">No labels found</p>
      </div>
    `
  }

  renderLoader () {
    const loader = new Loader().render({
      name: 'loader',
      count: 3,
      options: { animate: true, repeat: true, reach: 9, fps: 10 }
    })
    return html`
      <div class="flex flex-column flex-auto items-center justify-center">
        ${loader}
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

module.exports = Labels
