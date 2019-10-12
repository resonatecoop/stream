const html = require('choo/html')
const Component = require('choo/component')
const nanostate = require('nanostate')
const button = require('@resonate/button')
const { background, borders } = require('@resonate/theme-skins')
const link = require('@resonate/link-element')

class MenuBottom extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit
    this.local = {}

    this.machine = nanostate.parallel({
      library: nanostate('off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      }),
      browse: nanostate('off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      })
    })

    this.renderBrowseItems = this.renderBrowseItems.bind(this)
    this.renderLibraryItems = this.renderLibraryItems.bind(this)

    this.machine.on('browse:toggle', () => {
      if (this.element) this.rerender()
    })

    this.machine.on('library:toggle', () => {
      if (this.element) this.rerender()
    })
  }

  createElement (props) {
    this.local.href = props.href

    const menu = {
      on: this.renderLibraryItems,
      off: () => {}
    }[this.machine.state.library]() || {
      on: this.renderBrowseItems,
      off: () => {}
    }[this.machine.state.browse]() || this.renderNav()

    return html`
      <div class="${background} bt bw ${borders} flex">
        ${menu}
      </div>
    `
  }

  renderLibraryItems () {
    const closeButton = button({
      prefix: 'w3 h-100',
      onClick: (e) => this.machine.emit('library:toggle'),
      title: 'Close library',
      justifyCenter: true,
      style: 'blank',
      iconName: 'close',
      iconSize: 'xs'
    })

    const scope = this.state.user.username ? `/${this.state.user.username}` : ''

    const links = [
      {
        href: '/library/favorites',
        text: 'favorites'
      },
      {
        href: '/library/owned',
        text: 'owned'
      },
      {
        href: '/library/history',
        text: 'history'
      }

    ]

    return html`
      <div class="flex flex-auto items-center w-100 relative">
        <nav class="flex flex-auto w-100">
          <ul class="menu flex w-100 list ma0 pa0" style="height:3rem">
            ${links.map(item => {
              const { text } = item
              const href = scope + item.href
              const active = this.state.href === href

              return html`
                <li class="flex flex-auto relative ${active ? 'active' : ''}">
                  ${link({
                    prefix: 'link f5 flex justify-center items-center h-100 w-100',
                    href,
                    text
                  })}
                </li>
              `
            })}
          </ul>
        </nav>
        ${closeButton}
      </div>
    `
  }

  renderBrowseItems () {
    const closeButton = button({
      prefix: 'w3 h-100',
      onClick: (e) => this.machine.emit('browse:toggle'),
      justifyCenter: true,
      title: 'Close library',
      style: 'blank',
      iconName: 'close',
      iconSize: 'xs'
    })
    const links = [
      {
        text: 'artists',
        href: '/artists'
      },
      {
        text: 'labels',
        href: '/labels'
      },
      {
        text: 'new',
        href: '/playlist/latest'
      }
    ]
    return html`
      <div class="flex flex-auto items-center w-100 relative">
        <nav class="flex flex-auto w-100">
          <ul class="menu flex w-100 list ma0 pa0" style="height:3rem">
            ${links.map(item => {
              const opts = Object.assign({ prefix: 'link f5 flex justify-center items-center h-100 w-100' }, item)
              const active = this.state.href === item.href
              return html`
                <li class="flex flex-auto relative ${active ? 'active' : ''}">
                  ${link(opts)}
                </li>
              `
            })}
          </ul>
        </nav>
        ${closeButton}
      </div>
    `
  }

  renderNav () {
    const buttons = [
      {
        text: 'browse',
        onClick: (e) => this.machine.emit('browse:toggle')
      },
      {
        text: 'library',
        onClick: (e) => this.machine.emit('library:toggle')
      }
    ]
    const links = [
      {
        type: 'top-fav',
        name: 'top favorites'
      },
      {
        type: 'staff-picks',
        name: 'staff picks'
      }
    ]
    return html`
      <nav class="flex w-100">
        <ul class="menu flex w-100 list justify-between ma0 pa0" style="height:3rem">
          ${buttons.map(item => {
            const opts = Object.assign({
              prefix: 'flex h-100 w-100 items-center justify-center',
              style: 'blank'
            }, item)
            return html`
              <li class="flex flex-auto justify-center items-center">
                ${button(opts)}
              </li>
            `
          })}
          ${links.map(item => {
            const { type, name } = item
            const active = this.state.href === `/playlist/${type}`

            return html`
              <li class="flex flex-auto justify-center items-center relative ${active ? 'active' : ''}">
                ${link({
                  prefix: 'link f5 flex justify-center items-center h-100 w-100',
                  href: `/playlist/${type}`,
                  text: name
                })}
              </li>`
            })}
        </ul>
      </nav>
    `
  }

  update (props) {
    return this.local.href !== props.href
  }
}

module.exports = MenuBottom
