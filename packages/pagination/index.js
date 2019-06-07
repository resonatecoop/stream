const Nanocomponent = require('choo/component')
const html = require('choo/html')
const { foreground: fg } = require('@resonate/theme-skins')
const { nextMultiple, range } = require('@resonate/utils')
const noop = () => {}

class Pagination extends Nanocomponent {
  constructor (name, state, emit) {
    super(name)

    this.items = []

    this.state = state
    this.emit = emit

    this.page = this.page.bind(this)
    this.prev = this.prev.bind(this)
    this.next = this.next.bind(this)

    this.currentPage = 1
    this.prevPage = 0
    this.nextPage = 2

    if (this.state.query) {
      let pageNumber = Number(this.state.query.page)
      if (Number.isFinite(pageNumber)) {
        this.currentPage = pageNumber
        this.prevPage = this.currentPage - 1
        this.nextPage = this.currentPage + 1
      }
    }
  }

  page (pageNumber) {
    this.nextPage = pageNumber + 1
    this.currentPage = pageNumber
    this.prevPage = pageNumber - 1
    this.rerender()
    this.navigate(this.currentPage)
  }

  prev () {
    if (this.prevPage === 0) return
    this.nextPage = this.currentPage
    this.currentPage = this.currentPage - 1
    this.prevPage = this.currentPage - 1
    this.rerender()
    this.navigate(this.currentPage)
  }

  next () {
    this.prevPage = this.currentPage
    this.currentPage = this.currentPage + 1
    this.nextPage = this.currentPage + 1
    this.rerender()
    this.navigate(this.currentPage)
  }

  createElement (props) {
    const self = this

    this.navigate = props.navigate || noop

    return html`
      <div class="pagination flex flex-column flex-row-ns items-center justify-center mv6">
        <a href="/artists?page=${this.prevPage}" onclick=${handlePrev} class="${fg} ${this.prevPage < 1 ? 'o-20' : 'grow'} link ph3 pv2 mh2" style="cursor:${this.prevPage < 1 ? 'not-allowed' : 'pointer'}">Prev</a>
        <ul class="list ma0 pa0 mv4 flex justify-between">
          ${this.currentPage >= 4 ? html`<div class="flex">${range(1, 1).map(paginationItem(this.currentPage))}<span class="ph3">...</span></div>` : ''}
          ${this.currentPage === 2 ? range(this.currentPage - 1, this.currentPage - 1).map(paginationItem(this.currentPage)) : ''}
          ${this.currentPage === 3 ? range(this.currentPage - 2, this.currentPage - 1).map(paginationItem(this.currentPage)) : ''}
          ${this.currentPage >= 4 ? range(this.currentPage - 1, this.currentPage - 1).map(paginationItem(this.currentPage)) : ''}
          ${range(this.currentPage, this.currentPage + 1).map(paginationItem(this.currentPage))}
          <span class="ph3">...</span>
          ${range(nextMultiple(this.currentPage), nextMultiple(this.currentPage)).map(paginationItem(this.currentPage))}
        </ul>
        <a href="/artists?page=${this.nextPage}" onclick=${handleNext} class="${fg} link ph3 pv2 mh2 grow">Next</a>
      </div>
    `

    function handlePrev (e) {
      e.preventDefault()
      self.prev()
    }

    function handleNext (e) {
      e.preventDefault()
      self.next()
    }

    function paginationItem (currentPage) {
      return (pageNumber) => {
        const isActive = pageNumber === currentPage
        const handleClick = (e) => {
          e.preventDefault()
          self.page(pageNumber)
        }
        return html`
          <li class="mh2">
            <a href="/artists?page=${pageNumber}" onclick=${handleClick} class="link dim pa2 ${isActive ? 'b' : ''}" title="Go to page ${pageNumber}">
              ${pageNumber}
            </a>
          </li>
        `
      }
    }
  }

  beforerender () {
    if (this.state.query) {
      let pageNumber = Number(this.state.query.page)
      if (Number.isFinite(pageNumber)) {
        this.currentPage = pageNumber
        this.prevPage = this.currentPage - 1
        this.nextPage = this.currentPage + 1
      }
    } else {
      this.currentPage = 1
      this.prevPage = 0
      this.nextPage = 2
    }
  }

  update (props) {
    return false
  }
}

module.exports = Pagination
