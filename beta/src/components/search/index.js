const Component = require('choo/component')
const html = require('choo/html')
const icon = require('@resonate/icon-element')
const button = require('@resonate/button')
const nanostate = require('nanostate')
const morph = require('nanomorph')
const tags = require('../../lib/tags')
const { getAPIServiceClientWithAuth } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST
})
const { background: bg } = require('@resonate/theme-skins')

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
      const token = this.state.user.token

      if (!token) return

      try {
        const getClient = getAPIServiceClientWithAuth(token)
        const client = await getClient('plays')
        const result = await client.getLatestPlayedArtists({ limit: 3 })
        const { body: response } = result

        if (response.data) {
          this.local.artists = response.data
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

        if (this.local.inputValue.startsWith('#')) {
          this.emit(this.state.events.PUSHSTATE, `/tag?term=${this.local.inputValue.split('#')[1]}`)
        } else {
          this.emit('search', this.local.inputValue)
        }

        this.element.querySelector('input#search').blur()
      }
    }

    const renderQuery = q => {
      return html`
        <span class="query lh-copy f5">${q ? `Searching for: ${q}` : ''}</span>
      `
    }

    const searchInput = () => {
      const attrs = {
        class: 'bg-near-white bg-near-white--light black black--light bg-near-black--dark light-gray--dark pv3 pl1 pr0 w-100 bn',
        type: 'search',
        autocomplete: 'off',
        value: this.local.inputValue,
        oninput: e => {
          this.local.inputValue = e.target.value
          morph(this.element.querySelector('.query'), renderQuery(this.local.inputValue))
        },
        onfocus: () => this.local.machine.emit('focus:toggle'),
        onblur: () => this.local.machine.emit('focus:toggle'),
        spellcheck: false,
        name: 'q',
        id: 'search',
        required: true,
        placeholder: this.local.placeholder || 'Search'
      }

      return html`<input ${attrs}>`
    }

    return html`
      <div class="search-component fixed w-100 initial-l top-0 right-0">
        <form ${attrs}>
          <label class="search-label flex absolute right-2 z-1" for="search">
            ${icon('search', { size: 'sm', class: 'fill-dark-gray fill-dark-gray--light fill-mid-gray--dark' })}
            <span class="clip">Search</span>
          </label>
          <div class="js absolute right-4" style="top:50%;transform:translateY(-50%);">
            ${button({
              onClick: (e) => {
                this.state.components.header.machine.emit('search:toggle')
                this.local.inputValue = ''
                morph(this.element.querySelector('.query'), renderQuery(this.local.inputValue))
              },
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
          <div tabindex="0" class="typeahead ${bg} bl br bb bw b--mid-gray b--mid-gray--light b--near-black--dark flex flex-column absolute z-999 w-100 pv1 ph3">
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
              <dt class="f6 b ${this.local.artists.length ? 'db' : 'dn'}">Play history</dt>
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
