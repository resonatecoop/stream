const Component = require('choo/component')
const html = require('choo/html')
const clone = require('shallow-clone')
const nanostate = require('nanostate')
const Loader = require('@resonate/play-count-component')
const { isNode } = require('browser-or-node')
const compare = require('nanocomponent/compare')
const renderMessage = require('../../elements/message')
const ListItem = require('./item')

class Trackgroups extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit

    this.local = state.components[id] = Object.create({
      machine: nanostate.parallel({
        request: nanostate(isNode ? 'data' : 'idle', {
          idle: { start: 'loading' },
          loading: { resolve: 'data', reject: 'error', reset: 'idle' },
          data: { reset: 'idle', start: 'loading' },
          error: { reset: 'idle', start: 'loading' }
        }),
        layout: nanostate(state.query.layout || 'collection', {
          collection: { list: 'list', collection: 'collection' },
          list: { collection: 'collection', list: 'list' }
        }),
        loader: nanostate('off', {
          on: { toggle: 'off' },
          off: { toggle: 'on' }
        })
      })
    })

    this.local.error = {}

    this.local.machine.on('request:error', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.transitions.request.event('error', nanostate('error', {
      error: { start: 'loading' }
    }))

    this.local.machine.on('request:noResults', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.transitions.request.event('noResults', nanostate('noResults', {
      noResults: { start: 'loading' }
    }))

    this.local.machine.on('layout:list', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.on('layout:collection', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.on('loader:toggle', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.on('request:reject', () => {
      if (this.element) this.rerender()
    })
  }

  createElement (props) {
    this.local.href = props.href || this.state.href
    this.local.items = clone(props.items)

    const renderItems = (props) => {
      const { items } = props
      const layout = this.local.machine.state.layout

      return html`
        <div class="cf flex flex-wrap pb4">
          ${items.map((item, index) => {
            return this.state.cache(ListItem, `list-item-${layout}-${index}`).render({
              data: item,
              layout: layout,
              href: this.local.href
            })
          })}
        </div>
      `
    }

    const machine = {
      idle: () => {
        const items = this.local.items.length
          ? this.local.items
          : Array(5)
            .fill()
            .map((v, i) => {
              return {
                id: false,
                title: '…',
                release_date: new Date()
              }
            })
        return renderItems({ items })
      },
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
        off: () => {
          const items = Array(20)
            .fill()
            .map((v, i) => {
              return {
                id: false,
                title: '…',
                release_date: new Date()
              }
            })
          return renderItems({ items })
        }
      }[this.local.machine.state.loader],
      noResults: () => renderMessage({ message: 'No results to display' }),
      error: () => renderMessage({ type: 'error', message: this.local.error.message }),
      data: () => {
        return renderItems({ items: this.local.items })
      }
    }[this.local.machine.state.request]

    return machine()
  }

  update (props) {
    return compare(this.local.items, props.items)
  }
}

module.exports = Trackgroups
