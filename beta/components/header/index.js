const html = require('choo/html')
const Nanocomponent = require('choo/component')
const icon = require('@resonate/icon-element')
const nanostate = require('nanostate')
const button = require('@resonate/button')
const Dialog = require('@resonate/dialog-component')
const Search = require('../search')
const link = require('@resonate/link-element')
const ThemeSwitcher = require('../theme-switcher')
const AddCredits = require('../topup-credits')
const cookies = require('browser-cookies')
const morph = require('nanomorph')
const matchMedia = require('../../lib/match-media')

const logger = require('nanologger')
const log = logger('header')

const STRIPE_URL = 'https://js.stripe.com/v3/'
const loadScript = require('../../lib/load-script')

const {
  foreground: fg,
  iconFillInvert
} = require('@resonate/theme-skins')

class Header extends Nanocomponent {
  constructor (id, state, emit) {
    super(id)

    this.local = state.components[id] = {}

    this.emit = emit
    this.state = state

    this.local.user = {}

    this.local.credits = 0

    this.local.machine = nanostate.parallel({
      creditsDialog: nanostate('close', {
        open: { close: 'close' },
        close: { open: 'open' }
      }),
      library: nanostate('off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      }),
      discovery: nanostate('off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      }),
      browse: nanostate('off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      }),
      search: nanostate('off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      }),
      logoutDialog: nanostate('close', {
        open: { close: 'close' },
        close: { open: 'open' }
      })
    })

    this.local.machine.on('search:toggle', () => {
      morph(this.element.querySelector('.search'), this.renderSearch())
      if (this.local.machine.state.search === 'on') {
        const input = document.querySelector('input[type="search"]')
        if (input !== document.activeElement) input.focus()
      }
    })

    this.local.machine.on('creditsDialog:open', async () => {
      const status = cookies.get('cookieconsent_status')

      if (status !== 'allow') {
        this.local.machine.emit('creditsDialog:close')

        return emit('cookies:openDialog')
      }

      if (!this.state.stripe) {
        try {
          await loadScript(STRIPE_URL)

          this.state.stripe = Stripe(process.env.STRIPE_TOKEN) /* global Stripe */
        } catch (err) {
          log.error(err)
        }
      }

      const machine = this.local.machine
      const dialogEl = this.state.cache(Dialog, 'header-dialog').render({
        title: 'Top up your Resonate account',
        prefix: 'dialog-default dialog--sm',
        content: new AddCredits('credits-topup', state, emit).render(),
        onClose: function (e) {
          machine.emit('creditsDialog:close')
          this.destroy()
        }
      })

      document.body.appendChild(dialogEl)
    })

    this.local.machine.on('logoutDialog:open', () => {
      const confirmButton = button({
        type: 'submit',
        value: 'yes',
        size: 'none',
        style: 'default',
        text: 'Log out'
      })

      const cancelButton = button({
        type: 'submit',
        value: 'no',
        style: 'blank',
        size: 'none',
        text: 'Cancel'
      })

      const machine = this.local.machine

      const dialogEl = this.state.cache(Dialog, 'header-dialog').render({
        title: 'Log out',
        prefix: 'dialog-default dialog--sm',
        content: html`
          <div class="flex flex-column">
            <p class="lh-copy f5">Confirm you want to log out.</p>
            <div class="flex items-center">
              <div class="mr3">
                ${confirmButton}
              </div>
              <div>
                ${cancelButton}
              </div>
            </div>
          </div>
        `,
        onClose: function (e) {
          if (this.element.returnValue === 'yes') {
            emit('logout', true)
          }
          machine.emit('logoutDialog:close')
          this.destroy()
        }
      })

      document.body.appendChild(dialogEl)
    })

    this.local.machine.on('nav:toggle', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.on('browse:toggle', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.on('library:toggle', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.on('discovery:toggle', () => {
      if (this.element) this.rerender()
    })

    this.renderSearch = this.renderSearch.bind(this)
  }

  createElement (props) {
    this.local.credits = props.credits
    this.local.user = props.user || {}
    this.local.resolved = props.resolved
    this.local.href = props.href

    const nav = () => {
      if (this.local.user.uid) {
        return html`
          <nav role="navigation" aria-label="Main navigation" class="dropdown-navigation flex w-100 flex-auto justify-end-l">
            <ul class="list ma0 pa0 flex w-100 justify-around justify-left-l items-center">
              <li class="flex justify-center w-100">
                ${matchMedia('l')
                  ? html`<a href="/artists" class="link db b gray pv2 ph3">Browse</a>`
                  : html`
                    <button class="bg-transparent bn flex pa2" title="Open Browse Menu" onclick=${(e) => this.local.machine.emit('browse:toggle')} >
                      <span class="flex justify-center items-center">
                        Browse
                      </span>
                    </button>
                  `}
              </li>
              <li class="flex justify-center w-100">
                ${matchMedia('l')
                  ? html`<a href="/discovery" class="link db b gray pv2 ph3">Discovery</a>`
                  : html`
                    <button class="bg-transparent bn pa2" title="Open Discovery Menu" onclick=${(e) => this.local.machine.emit('discovery:toggle')} >
                      <span class="flex justify-center items-center">
                        Discovery
                      </span>
                    </button>
                  `}
              </li>
              <li class="flex justify-center w-100 clip-l">
                <button onclick=${() => this.local.machine.emit('search:toggle')} class="bn bg-transparent pa2">
                  ${icon('search', { size: 'sm', class: 'fill-white' })}
                </button>
              </li>
              <li class="flex justify-center w-100">
                ${matchMedia('l')
                  ? html`<a href="/u/${this.state.user.uid}-${this.state.user.nicename}/library/picks" class="link db b gray pv2 ph3">Library</a>`
                  : html`
                    <button class="bg-transparent bn pa2" title="Open Library Menu" onclick=${(e) => this.local.machine.emit('library:toggle')} >
                      <span class="flex justify-center items-center">
                        Library
                      </span>
                    </button>
                  `}
              </li>
              <li class="flex justify-center w-100">
                <button class="bg-transparent bn dropdown-toggle">
                  <span class="flex justify-center items-center">
                    ${icon('dropdown', { size: 'sm', class: 'fill-gray' })}
                  </span>
                </button>
                <ul class="${fg} list ma0 pa2 absolute right-0 dropdown z-999" style="width: 100vw;left:auto;margin-top:1px;max-width:24rem;">
                  <li class="flex items-start">
                    <div class="flex flex-column pa2 w-100">
                      Credits
                      <small class=${this.local.credits < 0.128 ? 'red' : ''}>${this.local.credits}</small>
                    </div>
                    <a href="" onclick=${(e) => { e.preventDefault(); this.local.machine.emit('creditsDialog:open') }} class="link flex items-center justify-end dim pa2">
                      <span class="f6 b ph2">Add credits</span>
                      <span class="flex justify-center items-center h1 w1">
                        ${icon('add-fat', { size: 'sm', class: iconFillInvert })}
                      </span>
                    </a>
                  </li>
                  <li>
                    ${this.state.cache(ThemeSwitcher, 'theme-switcher-header').render()}
                  </li>
                  <li>
                    <button onclick=${(e) => this.local.machine.emit('logoutDialog:open')} class="bn bg-transparent pa2">
                      Log out
                    </button>
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        `
      }

      return html`
        <nav role="navigation" aria-label="Main navigation" class="flex w-100 flex-auto justify-end-l">
          <ul class="${!this.state.resolved ? 'dn' : 'flex'} list ma0 pa0 w-100 w-auto-l justify-around justify-left-l items-center">
            <li class="mr3">
              <a class="link db pv2 ph3" href="/login">Login</a>
            </li>
            <li>
              <a class="link ${fg} db pv2 ph3" target="_blank" rel="noopener" href="https://${process.env.OAUTH2_SERVER_DOMAIN}/join">Join</a>
            </li>
          </ul>
        </nav>
      `
    }

    const renderDefault = () => {
      return html`
        ${this.renderSearch()}
        ${nav()}
      `
    }

    const subMenu = {
      on: this.renderSubMenuItems({ name: 'library', eventName: 'library:toggle' }, this.local.machine)
    }[this.local.machine.state.library] || {
      on: this.renderSubMenuItems({ name: 'browse', eventName: 'browse:toggle' }, this.local.machine)
    }[this.local.machine.state.browse] || {
      on: this.renderSubMenuItems({ name: 'discovery', eventName: 'discovery:toggle' }, this.local.machine)
    }[this.local.machine.state.discovery] || renderDefault

    return html`
      <header role="banner" class="bg-black white fixed sticky-l left-0 top-0-l bottom-0 right-0 w-100 z-9999 flex items-center pv2 pv1-l">
        <div class="dn relative-l flex-l flex-auto-l w-100-l">
          ${link({
            href: '/',
            text: icon('logo', { class: 'fill-white' }),
            prefix: 'link flex items-center flex-shrink-0 h-100 ph2 ml2',
            title: 'Stream2own'
          })}
        </div>
        ${subMenu()}
      </header>
    `
  }

  renderSubMenuItems ({ name = 'library', eventName }, machine) {
    return () => {
      const items = {
        library: [
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
        ],
        browse: [
          {
            text: 'artists',
            href: '/artists'
          },
          {
            text: 'labels',
            href: '/labels'
          },
          {
            text: 'bands',
            href: '/bands'
          }
        ],
        discovery: [
          {
            href: '/discovery',
            text: 'Discovery'
          },
          {
            href: '/discovery/top-fav',
            text: 'Top Favorites'
          },
          {
            href: '/discovery/staff-picks',
            text: 'Staff Picks'
          },
          {
            href: '/discovery/random',
            text: 'Random'
          }
        ]
      }[name]

      const closeButton = button({
        prefix: 'w3 h-100',
        onClick: () => machine.emit(eventName),
        title: 'Close menu',
        justifyCenter: true,
        style: 'blank',
        iconName: 'close',
        iconSize: 'xs'
      })

      return html`
        <div class="flex flex-auto items-center w-100 relative">
          <nav class="flex flex-auto w-100">
            <ul class="menu flex w-100 list ma0 pa0">
              ${items.map(item => {
                const { text, href } = item
                const active = this.state.href === href

                return html`
                  <li class="flex flex-auto justify-center relative ${active ? 'active' : ''}">
                    <a href=${href} class="link db pv2 ph3">${text}</a>
                  </li>
                `
              })}
            </ul>
          </nav>
          ${closeButton}
        </div>
      `
    }
  }

  renderSearch () {
    const search = {
      on: () => this.state.cache(Search, 'search').render(),
      off: () => {
        const attrs = {
          onclick: (e) => {
            this.local.machine.emit('search:toggle')
          },
          class: 'bn dn db-l bg-transparent'
        }
        return html`
          <button ${attrs}>
            <div class="flex items-center">
              ${icon('search', { size: 'sm', class: 'fill-gray' })}
              <span class="db pl3 b gray">Search</span>
            </div>
          </button>
        `
      }
    }[this.local.machine.state.search]

    return html`
      <div class="search w-100-l flex-l justify-center-l">
        ${search()}
      </div>
    `
  }

  update (props) {
    if (props.resolved && this.local.machine.state.creditsDialog !== 'open') {
      if (this.state.query.payment_intent) {
        this.local.machine.emit('creditsDialog:open')
      }
    }
    return props.credits !== this.local.credits ||
      props.href !== this.local.href ||
      props.resolved !== this.local.resolved
  }
}

module.exports = Header
