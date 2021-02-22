const Component = require('choo/component')
const html = require('choo/html')
const icon = require('@resonate/icon-element')
const button = require('@resonate/button')
const nanostate = require('nanostate')
const morph = require('nanomorph')
const tags = require('../../lib/tags')

class Search extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state

    this.local = state.components[id] = {}

    this.local.artists = []

    this.local.machine = nanostate.parallel({
      focus: nanostate('off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      })
    })

    this.local.machine.on('focus:toggle', async () => {
      try {
        const result = await this.state.apiv2.plays.history.artists({ limit: 3 })

        if (result.data) {
          this.local.artists = result.data
        }

        this.rerender()
      } catch (err) {
        this.emit('error', err)
      }
    })

    this.local.placeholder = ''
    this.local.inputValue = ''
  }

  createElement (props = {}) {
    this.local.inputValue = this.local.inputValue || this.state.params.q || ''
    this.local.placeholder = props.placeholder

    // form attrs
    const attrs = {
      action: '/search',
      id: 'searchForm',
      name: 'searchForm',
      class: 'relative',
      onsubmit: (e) => {
        e.preventDefault()

        const val = e.target.search.value

        if (!val) return false
        if (val.length < 3) return false

        this.local.inputValue = e.target.search.value

        this.emit('search', this.local.inputValue)
      }
    }

    const renderQuery = q => {
      return html`
        <span class="query lh-copy f5">${q ? `Searching for: ${q}` : ''}</span>
      `
    }

    const searchInput = () => {
      const attrs = {
        class: 'bg-near-black white bg-near-black--light white--light pv3 pv2-l pl3 pr0 w-100 bn',
        type: 'search',
        autocomplete: 'off',
        value: this.local.inputValue,
        oninput: e => {
          this.local.inputValue = e.target.value
          return morph(this.element.querySelector('.query'), renderQuery(this.local.inputValue))
        },
        onfocus: () => this.local.machine.emit('focus:toggle'),
        onblur: () => this.local.machine.emit('focus:toggle'),
        spellcheck: false,
        name: 'q',
        id: 'search',
        required: true,
        placeholder: this.local.placeholder || 'Search for an artist, a label, a track or a release'
      }

      return html`<input ${attrs}>`
    }

    return html`
      <div class="search-component h2-l fixed z-max w-100 initial-l bg-black bg-black--light white--light left-0 top-3 right-0">
        <form ${attrs}>
          <label class="search-label flex absolute left-1 z-1" for="search">
            ${icon('search', { size: 'sm' })}
            <span class="clip">Search</span>
          </label>
          <div class="js absolute right-1" style="top:50%;transform:translateY(-50%);">
            ${button({
              onClick: (e) => this.state.components.header.machine.emit('search:toggle'),
              prefix: 'h-100',
              style: 'blank',
              size: 'sm',
              title: 'Close search',
              justifyCenter: true,
              iconName: 'close',
              iconSize: 'xs'
            })}
          </div>
          ${searchInput()}
          <div tabindex="0" class="typeahead flex flex-column bg-dark-gray white white--light bg-dark-gray--light black--light absolute z-999 w-100 pv1 ph3">
            ${renderQuery(this.local.inputValue)}
            <dl>
              <dt class="f6 b">Tags</dt>
              <dd class="ma0">
                <ul class="list ma0 pa0 flex flex-wrap">
                  ${tags.map(tag => {
                    const url = new URL('/tag', 'http://localhost')
                    url.search = new URLSearchParams({ term: tag.toLowerCase() })
                    const href = url.pathname + url.search

                    return html`
                      <li>
                        <a class="link db ph1 black mr1 mv1 f5 br-pill bg-light-gray" href=${href}>#${tag}</a>
                      </li>
                    `
                  })}
                </ul>
              </dd>
            </dl>
            <dl>
              <dt class="f6 b ${this.local.artists.length ? 'db' : 'dn'}">Latest artists you have recently listened to</dt>
              <dd class="ma0">
                <ul class="list ma0 pa0 flex flex-column">
                  ${this.local.artists.map(({ meta_value: name }) => html`
                    <li class="mb2">
                      <a class="db lh-copy f5 link" href="/search?q=${name}">
                        ${name}
                      </a>
                    </li>
                  `
                  )}
                </ul>
              </dd>
            </dl>
          </div>
        </form>
      </div>
    `
  }

  update () {
    return false
  }
}

module.exports = Search
