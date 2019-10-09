const Nanocomponent = require('choo/component')
const compare = require('nanocomponent/compare')
const html = require('choo/html')
const clone = require('shallow-clone')
const ArtistItem = require('./item')
const nanostate = require('nanostate')
const nanologger = require('nanologger')
const Loader = require('@resonate/play-count-component')
const assert = require('assert')
const Pagination = require('@resonate/pagination')
const renderMessage = require('../../elements/message')

class Artists extends Nanocomponent {
  constructor (id, state, emit) {
    super(id)

    this.items = []

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

    this.local.machine.event('404', nanostate('404', {
      404: { start: 'idle' }
    }))

    this.local.events.on('loader:toggle', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.on('404', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.on('error', () => {
      if (this.element) this.rerender()
    })
  }

  createElement (props) {
    assert(typeof props === 'object', 'props should be an object')

    const state = this.state
    const emit = this.emit

    const { numberOfPages = 1, pagination: paginationEnabled = true } = props

    this.local.shuffle = props.shuffle
    this.local.items = clone(props.items) || []

    const machine = {
      loading: {
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
      }[this.local.events.state.loader],
      404: () => renderMessage({ message: 'No artists found' }),
      error: () => renderMessage({ type: 'error', message: 'Failed to fetch artists' })
    }[this.local.machine.state]

    const artists = typeof machine === 'function' ? machine() : renderArtists(this.local.items, this.local.shuffle)

    let paginationEl

    if (paginationEnabled && numberOfPages > 1) {
      paginationEl = new Pagination('artists-pagination', state, emit).render({
        navigate: function (pageNumber) {
          const path = !/artists/.test(state.href) ? '/artists' : ''
          emit(state.events.PUSHSTATE, state.href + `${path}?page=${pageNumber}`)
        },
        path: !/artists/.test(state.href) ? '/artists' : '',
        numberOfPages
      })
    }

    return html`
      <div class="flex flex-column flex-auto w-100">
        ${artists}
        ${paginationEl}
      </div>
    `

    function renderArtists (items, shuffle = false) {
      if (shuffle) {
        items = items.sort(() => Math.random() - 0.5)
      }

      return html`
        <ul class="artists list ma0 pa0 cf">
          ${items.map((props) => {
            const { id } = props
            const artist = new ArtistItem(`artist-item-${id}`).render(props)
            return html`
              <li class="fl w-50 w-third-m w-20-l pa3 grow first-child--large">
                ${artist}
              </li>
            `
          })}
        </ul>
      `
    }
  }

  unload () {
    if (this.local.machine.state !== 'idle') {
      this.local.machine.emit('reset')
    }
  }

  update (props) {
    return compare(props.items, this.local.items)
  }
}

module.exports = Artists
