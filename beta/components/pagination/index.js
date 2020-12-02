const Component = require('choo/component')
const html = require('nanohtml')
const icon = require('@resonate/icon-element')
const { iconFill } = require('@resonate/theme-skins')
const { nextMultiple, range } = require('@resonate/utils')

class Pagination extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit

    this.local = state.components[id] = {}

    this.local.page = 1
    this.local.pages = 1
  }

  createElement (props) {
    this.local.pages = props.pages || this.local.pages
    this.local.page = props.page || this.local.page
    this.local.href = props.href || this.state.href

    const arrow = (page) => {
      const direction = page < this.local.page ? 'left' : 'right'
      const url = new URL(this.local.href, process.env.APP_HOST || 'https://beta.resonate.localhost')
      url.search = new URLSearchParams(Object.assign({}, this.state.query, {
        page: page
      }))

      const attrs = {
        href: url.pathname + url.search,
        class: `${page < 1 ? 'o-20' : 'grow'} link ph3 pv2 mh2`,
        style: `cursor:${page < 1 ? 'not-allowed' : 'pointer'}`
      }

      return html`
        <a ${attrs}>
          ${icon('arrow', { class: `${iconFill}${direction === 'right' ? ' flip-x' : ''}`, size: 'sm' })}
        </a>
      `
    }

    const paginationItem = (page) => {
      if (page > this.local.pages) return
      const isActive = page === this.local.page
      const url = new URL(this.local.href, process.env.APP_HOST || 'https://beta.resonate.localhost')
      url.search = new URLSearchParams(Object.assign({}, this.state.query, {
        page: page
      }))
      const attrs = {
        href: url.pathname + url.search,
        class: `link dim pa2 ${isActive ? 'b' : ''}`,
        title: `Go to page ${page}`
      }
      return html`
        <li class="mh2">
          <a ${attrs}>
            ${page}
          </a>
        </li>
      `
    }

    return html`
      <div class="pagination flex flex-column flex-row-ns items-center justify-center mv6">
        ${arrow(this.local.page - 1)}
        <ul class="list ma0 pa0 mv4 flex justify-between">
          ${range(this.local.page, this.local.page + 1).map(paginationItem)}
          ${range(nextMultiple(this.local.page), nextMultiple(this.local.page)).map(paginationItem)}
        </ul>
        ${arrow(this.local.page + 1)}
      </div>
    `
  }

  update (props) {
    return props.pages !== this.local.pages ||
      props.page !== this.local.page
  }
}

module.exports = Pagination
