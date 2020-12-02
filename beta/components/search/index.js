const Component = require('choo/component')
const html = require('choo/html')
const icon = require('@resonate/icon-element')
// const Nanobounce = require('nanobounce')
// const nanobounce = Nanobounce()
const button = require('@resonate/button')
const { foreground: fg } = require('@resonate/theme-skins')
const nanostate = require('nanostate')
const morph = require('nanomorph')

class Search extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state

    this.local = state.components[id] = {}

    // TODO user custom
    this.local.tags = [
      'experimental',
      'folk',
      'pop',
      'ambient',
      'world',
      'jazz',
      'acoustic',
      'hiphop',
      'rap',
      'funk',
      'soul',
      'blues',
      'rnb',
      'classical',
      'country',
      'rock',
      'metal'
    ]

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

    this.submit = this.submit.bind(this)
  }

  createElement (props = {}) {
    this.local.inputValue = this.local.inputValue || this.state.params.q || ''
    this.local.placeholder = props.placeholder

    const attrs = {
      class: 'bg-near-black white pv3 pv2-l pl3 pr0 w-100 bn',
      type: 'search',
      autocomplete: 'off',
      value: this.local.inputValue,
      oninput: (e) => {
        this.local.inputValue = e.target.value
        morph(this.element.querySelector('.query'), this.renderQuery(this.local.inputValue))
      },
      onfocus: () => {
        this.local.machine.emit('focus:toggle')
      },
      onblur: () => {
        this.local.machine.emit('focus:toggle')
      },
      spellcheck: false,
      name: 'search',
      id: 'searchbox',
      required: true,
      placeholder: this.local.placeholder || 'Search'
    }

    return html`
      <div class="search-component h2-l fixed w-100 initial-l bg-black bg-black--light bg-near-black--dark left-0 top-2 right-0">
        <form id="searchForm" name="searchForm" class="relative" onsubmit=${this.submit}>
          <label class="search-label flex absolute left-1 z-1" for="search">
            ${icon('search', { size: 'sm' })}
          </label>
          <div class="absolute right-1" style="top:50%;transform:translateY(-50%);">
            ${button({
              onClick: (e) => this.state.components.header.machine.emit('search:toggle'),
              prefix: 'h-100',
              style: 'blank',
              justifyCenter: true,
              iconName: 'close',
              iconSize: 'xs'
            })}
          </div>
          <input ${attrs}>
          <div tabindex="0" class="typeahead ${fg} absolute z-999 w-100 pa3">
            <div class="flex flex-column">
              ${this.renderQuery(this.local.inputValue)}

              <span class="f6 b">Tags</span>

              <ul class="list ma0 pa0 flex flex-wrap">
                ${this.local.tags.map(tag => {
                  const href = `/tag/${tag.toLowerCase()}`

                  return html`
                    <li>
                      <a class="link db ph1 black mr1 mv1 f5 br-pill bg-gray" href=${href}>#${tag}</a>
                    </li>
                  `
                })}
              </ul>

              <span class="f6 b ${this.local.artists.length ? 'db' : 'dn'}">Artists played recently</span>

              <ul class="list ma0 pa0 flex flex-column">
                ${this.local.artists.map(item => {
                  const { meta_value: name } = item

                  return html`
                    <li class="mb2">
                      <a class="db lh-copy f5 link" href="/search/${name}">
                        ${name}
                      </a>
                    </li>
                  `
                })}
              </ul>
            </div>
          </div>
        </form>
      </div>
    `
  }

  renderQuery (q) {
    return html`
      <span class="query lh-copy f5">${q ? `Searching for: ${q}` : ''}</span>
    `
  }

  submit (e) {
    e.preventDefault()

    const val = e.target.search.value

    if (!val) return false
    if (val.length < 3) return false

    this.local.inputValue = e.target.search.value

    this.emit('search', this.local.inputValue)
  }

  update () {
    return false
  }
}

module.exports = Search
