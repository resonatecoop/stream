const html = require('choo/html')
const Component = require('choo/component')
const nanostate = require('nanostate')
const icon = require('@resonate/icon-element')
const Search = require('../search')
const button = require('@resonate/button')
const { background, borders: borderColors } = require('@resonate/theme-skins')

class Menu extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit
    this.local = state.components[id] = Object.create({
      machine: nanostate.parallel({
        search: nanostate('off', {
          on: { toggle: 'off' },
          off: { toggle: 'on' }
        })
      })
    })

    this.renderMenu = this.renderMenu.bind(this)
    this.renderSearch = this.renderSearch.bind(this)

    this.local.machine.on('search:toggle', () => {
      if (this.element) {
        this.rerender()
      }
    })
  }

  createElement (props) {
    this.local.href = props.href
    this.local.title = props.title

    const main = {
      on: this.renderSearch,
      off: this.renderMenu
    }[this.local.machine.state.search]

    return html`
      <div class="menu-component ${background} bb bw ${borderColors} flex justify-center flex-column z-3" style="height:3rem">
        ${main()}
      </div>
    `
  }

  renderSearch () {
    const search = this.state.cache(Search, 'search').render({
      placeholder: 'Search for tracks, artists, labels'
    })

    const closeButton = button({
      onClick: (e) => this.local.machine.emit('search:toggle'),
      prefix: 'w3 h-100',
      style: 'blank',
      justifyCenter: true,
      iconName: 'close',
      iconSize: 'xs'
    })

    return html`
      <div class="relative flex items-center w-60 w-100-l mw6 center">
        ${search}
        <div class="absolute" style="left:100%;">
          ${closeButton}
        </div>
      </div>
    `
  }

  renderMenu () {
    return html`
      <div class="flex flex-auto">
        <div class="flex flex-auto-l w-100-l"></div>
        <div class="flex flex-auto items-center justify-center w-100">
          ${this.local.title ? html`<h2 class="lh-title f5 normal mt0 mb0 ttc truncate">${this.local.title}</h2>` : ''}
        </div>
        <nav class="flex flex-auto w-100">
          <ul class="flex w-100 list ma0 pa0 justify-end-l" style="height:3rem">
            <li class="flex flex-auto mw4 ${this.local.href === '/playlist/random' ? 'active' : ''}">
              <a href="/playlist/random" class="link flex items-center justify-center color-inherit no-underline f5 ph2">
                ${icon('random', { size: 'sm' })}
                <span class="pl3">random</span>
              </a>
            </li>
            <li class="flex flex-auto mw4 ${this.local.machine.state.search === 'on' ? 'active' : ''}">
              ${button({
                prefix: 'w-100 f5',
                style: 'blank',
                iconName: 'search',
                iconSize: 'sm',
                justifyCenter: true,
                text: 'search',
                onClick: (e) => this.local.machine.emit('search:toggle')
              })}
            </li>
          </ul>
        </nav>
      </div>
    `
  }

  update (props) {
    return props.href !== this.local.href ||
      props.title !== this.local.title
  }
}

module.exports = Menu
