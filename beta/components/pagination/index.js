const Component = require('choo/component')
const html = require('nanohtml')
const icon = require('@resonate/icon-element')
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
      const url = new URL(this.local.href, process.env.APP_HOST || 'http://localhost')

      url.search = new URLSearchParams(Object.assign({}, this.state.query, {
        page: page
      }))

      const shouldDisable = page < 1 || page > this.local.pages

      const attrs = {
        href: url.pathname + url.search,
        class: `${shouldDisable ? 'o-20' : 'grow'} link ph3 pv2 mh2`,
        style: `cursor:${shouldDisable ? 'not-allowed' : 'pointer'}`,
        onclick: e => {
          if (shouldDisable) {
            e.preventDefault()
            return false
          }
        },
        title: `Go to page ${page}`
      }

      return html`
        <a ${attrs}>${icon('arrow', { class: direction === 'right' ? ' flip-x' : '' })}</a>
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
        style: 'font-feature-settings:"tnum";font-variant-numeric:tabular-nums',
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

    const max = 3 // number of items to display around the current page
    const forward = nextMultiple(this.local.page + max)

    return html`
      <div class="pagination flex flex-column flex-row-ns items-center justify-center mv6">
        ${arrow(this.local.page - 1)}
        <ul class="list ma0 pa0 mv3 flex flex-wrap justify-center">
          ${this.local.page >= max && this.local.page - max > 1 ? paginationItem(1) : ''}
          ${this.local.page >= max && this.local.page - max > 1 ? html`<span class="ph3">...</span>` : ''}
          ${range(this.local.page - max, this.local.page - 1).map(paginationItem)}
          ${paginationItem(this.local.page)}
          ${range(this.local.page + 1, this.local.page + max).map(paginationItem)}
          ${forward < this.local.pages ? html`<span class="ph3">...</span>` : ''}
          ${forward < this.local.pages ? paginationItem(forward) : ''}
        </ul>
        ${arrow(this.local.page + 1)}
      </div>
    `
  }

  update (props) {
    return true
  }
}

module.exports = Pagination
