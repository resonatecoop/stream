const Nanocomponent = require('choo/component')
const compare = require('nanocomponent/compare')
const html = require('choo/html')
const clone = require('shallow-clone')
const { isNode } = require('browser-or-node')
const ProfileItem = require('./item')
const nanostate = require('nanostate')
const nanologger = require('nanologger')
const Loader = require('@resonate/play-count-component')
const assert = require('assert')
const renderMessage = require('../../elements/message')

class Profiles extends Nanocomponent {
  constructor (id, state, emit) {
    super(id)

    this.items = []

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
        loader: nanostate('off', {
          on: { toggle: 'off' },
          off: { toggle: 'on' }
        })
      })
    })

    this.log = nanologger(id)

    this.local.error = {
      message: 'Failed to fetch profiles' // default error message
    }

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

    this.local.machine.on('loader:toggle', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.on('request:reject', () => {
      if (this.element) this.rerender()
    })
  }

  createElement (props) {
    assert(typeof props === 'object', 'props should be an object')

    const state = this.state
    const emit = this.emit

    this.local.shuffle = props.shuffle
    this.local.items = clone(props.items) || []

    const machine = {
      idle: () => {},
      loading: {
        off: () => {},
        on: () => {
          const loader = new Loader('loader', state, emit).render({
            count: 3,
            options: { animate: true, repeat: true, reach: 9, fps: 10 }
          })

          return html`
            <div class="flex flex-column flex-auto items-center justify-center h5">
              ${loader}
            </div>
          `
        }
      }[this.local.machine.state.loader],
      data: () => {
        return html`
          <ul class="list ma0 pa0 cf">
            ${this.local.items.map((props) => {
              const { id } = props
              return new ProfileItem(`profile-item-${id}`, this.state).render(props)
            })}
          </ul>
        `
      },
      noResults: () => renderMessage({ message: 'No profiles found' }),
      error: () => renderMessage({ type: 'error', message: this.local.error.message })
    }[this.local.machine.state.request]

    return html`
      <div class="flex flex-column flex-auto w-100">
        ${machine()}
      </div>
    `
  }

  unload () {
    if (this.local.machine.state !== 'idle') {
      this.local.machine.emit('request:reset')
    }
  }

  update (props) {
    return compare(props.items, this.local.items)
  }
}

module.exports = Profiles
