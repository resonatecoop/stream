const Component = require('choo/component')
const html = require('nanohtml')
const icon = require('@resonate/icon-element')
const { iconFill } = require('@resonate/theme-skins')
const { nextMultiple, range } = require('@resonate/utils')

/**
 * WIP Rewrite of @resonate/pagination
 */

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
        class: `${page < 1 || page > this.local.pages ? 'o-20' : 'grow'} link ph3 pv2 mh2`,
        style: `cursor:${page < 1 || page > this.local.pages ? 'not-allowed' : 'pointer'}`,
        onclick: (e) => {
          if (page < 1 || page > this.local.pages) {
            e.preventDefault()
            return false
          }
        },
        title: `Go to page ${page}`
      }

      return html`
        <a ${attrs}>
          ${icon('arrow', { class: `${iconFill}${direction === 'right' ? ' flip-x' : ''}`, size: 'sm' })}
        </a>
      `
    }

    const paginationItem = (page) => {
      if (page < 1) return
      if (page > this.local.pages) return

      const isActive = page === this.local.page
      const url = new URL(this.local.href, process.env.APP_HOST || 'http://localhost')
      url.search = new URLSearchParams(Object.assign({}, this.state.query, {
        page: page
      }))

      const attrs = {
        href: url.pathname + url.search,
        class: `link dim pa2 ${isActive ? 'b' : ''}`,
        title: `Go to page ${page}`
      }
      return html`
        <li class="mh2 mb2">
          <a ${attrs}>
            ${page}
          </a>
        </li>
      `
    }

    const forward = nextMultiple(this.local.page + 10)

    return html`
      <div class="pagination flex flex-column flex-row-ns items-center justify-center mv6">
        ${arrow(this.local.page - 1)}
        <ul class="list ma0 pa0 mv3 flex flex-wrap justify-center">
          ${this.local.page >= 10 ? paginationItem(1) : ''}
          ${this.local.page >= 10 ? html`<span class="ph3">...</span>` : ''}
          ${range(this.local.page < 10 ? 1 : this.local.page, this.local.page + 10 < this.local.pages ? this.local.page + 10 : this.local.pages).map(paginationItem)}
          ${forward < this.local.pages ? html`<span class="ph3">...</span>` : ''}
          ${forward < this.local.pages ? paginationItem(forward) : ''}
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
