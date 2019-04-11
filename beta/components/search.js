const Component = require('choo/component')
const nanostate = require('nanostate')
const html = require('choo/html')
const css = require('sheetify')
const icon = require('@resonate/icon-element')
const inputEl = require('@resonate/input-element')
const { iconFillInvert } = require('@resonate/theme-skins')

const prefix = css`
  :host .search-label {
    top: 50%;
    transform: translateY(-50%) scaleX(-1);
  }
  :host input[type="search"] {
    appearance: none;
    text-indent: 1.5rem;
    font-family: inherit;
  }
  :host input[type="search"]::-webkit-search-cancel-button {
    appearance: none;
  }
`

class Search extends Component {
  constructor (name, state, emit) {
    super(name)

    this.emit = emit

    this.machine = nanostate('idle', {
      idle: { click: 'loading' },
      loading: { resolve: 'data', reject: 'error', click: 'loading' },
      data: { click: 'loading' },
      error: { click: 'loading' }
    })

    this.machine.on('loading', () => this.search())

    this.state = {
      placeholder: '',
      input: '',
      data: null
    }

    this.search = this.search.bind(this)

    this.submit = this.submit.bind(this)
  }

  search () {
    const val = this.state.input
    this.emit('search', val)
  }

  createElement (props) {
    this.state.placeholder = props.placeholder

    const searchInput = inputEl({
      autofocus: true,
      type: 'search',
      onchange: e => (this.state.input = e.target.value) && this.rerender(),
      onKeyDown: e => { if (e.key === 'Escape') this.emit('search:close') },
      value: this.state.input,
      name: 'search',
      id: 'searchbox',
      required: true,
      placeholder: this.state.placeholder
    })

    return html`
      <div class="${prefix} w-100 pl1 pl0-ns">
        <form id="searchForm" name="searchForm" class="flex relative ma0" onsubmit=${this.submit}>
          <label class="search-label flex absolute left-1 z-1" for="search">
            ${icon('search', { 'class': `icon icon--sm ${iconFillInvert}` })}
          </label>
          ${searchInput}
        </form>
      </div>
    `
  }

  submit (e) {
    e.preventDefault()

    if (e.target.search.value === '') return false

    this.state.input = e.target.search.value

    this.machine.emit('click')
  }

  load () {
    const input = this.element.querySelector('input[type="search"]')
    input.focus()
  }

  update (props) {
    return props.q !== this.state.input
  }
}

module.exports = Search
