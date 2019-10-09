const Component = require('choo/component')
const compare = require('nanocomponent/compare')
const html = require('choo/html')
const clone = require('shallow-clone')
const nanostate = require('nanostate')
const nanologger = require('nanologger')
const Loader = require('@resonate/play-count-component')
const Pagination = require('@resonate/pagination')
const LabelItem = require('./item')

class Labels extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit

    this.local = state.components[id] = Object.create({
      machine: nanostate('idle', {
        idle: { start: 'loading' },
        loading: { resolve: 'data', reject: 'error', reset: 'idle' },
        data: { reset: 'idle', start: 'loading' },
        error: { reset: 'idle', start: 'loading' }
      }),
      events: nanostate.parallel({
        loader: nanostate('off', {
          on: { toggle: 'off' },
          off: { toggle: 'on' }
        })
      })
    })

    this.log = nanologger(id)

    this.items = []

    this.renderLabels = this.renderLabels.bind(this)

    this.local.machine.event('404', nanostate('404', {
      404: { start: 'idle' }
    }))

    this.local.events.on('loader:toggle', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.on('404', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.on('loading', () => {
      this.log.info('loading')
    })

    this.local.machine.on('error', () => {
      this.log.error('error')
      if (this.element) this.rerender()
    })

    this.local.machine.on('data', () => {
      this.log.info('data')
      if (this.element) this.rerender()
    })
  }

  createElement (props = {}) {
    const self = this
    const { items = [], pagination: paginationEnabled = true, numberOfPages = 1 } = props

    this.items = clone(items)

    const labels = {
      loading: {
        on: () => {
          const loader = new Loader('loader', this.state, this.emit).render({
            count: 3,
            options: { animate: true, repeat: true, reach: 9, fps: 10 }
          })
          return html`
            <div class="flex flex-column flex-auto items-center justify-center h5">
              ${loader}
            </div>
          `
        },
        off: () => {}
      }[this.local.events.state.loader](),
      404: html`
        <div class="flex flex-column flex-auto w-100 items-center justify-center">
          <p class="tc">No labels found</p>
        </div>
      `,
      error: html`
        <div class="flex flex-column flex-auto w-100 items-center justify-center">
          <p>Failed to fetch labels</p>
        </div>
      `
    }[this.local.machine.state] || this.renderLabels()

    let paginationEl

    if (paginationEnabled && numberOfPages > 1) {
      paginationEl = new Pagination('labels-pagination', this.state, this.emit).render({
        navigate: function (pageNumber) {
          self.emit(self.state.events.PUSHSTATE, self.state.href + `?page=${pageNumber}`)
        },
        numberOfPages
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
      const label = new LabelItem().render({ avatar, id, name })
      return html`
        <li class="first-child--large fl w-50 w-third-m w-20-l pa3 grow">
          ${label}
        </li>
      `
    })

    return html`
      <ul class="labels list ma0 pa0 cf">
        ${items}
      </ul>
    `
  }

  unload () {
    if (this.local.machine.state !== 'idle') {
      this.local.machine.emit('reset')
    }
  }

  update (props) {
    if (props) {
      return compare(props.items, this.items)
    }
    return false
  }
}

module.exports = Labels
