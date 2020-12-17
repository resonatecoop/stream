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

const logger = require('nanologger')
const log = logger('header')

const STRIPE_URL = 'https://js.stripe.com/v3/'
const loadScript = require('../../lib/load-script')

const { foreground: fg } = require('@resonate/theme-skins')

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
        outline: true,
        theme: 'light',
        text: 'Log out'
      })

      const cancelButton = button({
        type: 'submit',
        value: 'no',
        outline: true,
        theme: 'light',
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
            <ul class="list menu ma0 pa0 flex w-100 justify-around justify-left-l items-center">
              <li class="flex flex-auto justify-center relative h-100 w-100${/artists|labels/.test(this.state.href) ? ' active' : ''}">
                <a href="/artists" class="dn db-l link b gray pv2 ph3">Browse</a>
                <button class="db dn-l bg-transparent bn b gray pa0" title="Open Browse Menu" onclick=${(e) => this.local.machine.emit('browse:toggle')} >
                  <span class="flex justify-center items-center">
                    Browse
                  </span>
                </button>
              </li>
              <li class="flex flex-auto justify-center relative h-100 w-100 ${this.state.href === '/discovery' ? ' active' : ''}">
                <a href="/discovery" class="link db b gray pv2 ph3">Discovery</a>
              </li>
              <li class="flex justify-center w-100 clip-l">
                <button onclick=${() => this.local.machine.emit('search:toggle')} class="bn bg-transparent pa0">
                  ${icon('search', { size: 'sm', class: 'fill-white' })}
                </button>
              </li>
              <li class="flex flex-auto justify-center relative h-100 w-100${this.state.href.includes('library') ? ' active' : ''}">
                <a href="/u/${this.state.user.uid}-${this.state.user.nicename}/library/favorites" class="link dn db-l b gray pv2 ph3">Library</a>
                <button class="db dn-l bg-transparent bn b gray pa0" title="Open Library Menu" onclick=${(e) => this.local.machine.emit('library:toggle')} >
                  <span class="flex justify-center items-center">
                    Library
                  </span>
                </button>
              </li>
              <li class="flex flex-auto justify-center w-100">
                <button title="Open menu" class="bg-transparent bn dropdown-toggle pa0">
                  <span class="flex justify-center items-center">
                    ${icon('dropdown', { size: 'sm', class: 'fill-gray' })}
                  </span>
                </button>
                <ul class="${fg} ba bw b--near-black list ma0 pa3 absolute right-0 dropdown z-999" style="width:100vw;left:auto;margin-top:1px;max-width:24rem;">
                  <li class="flex items-start">
                    <h3 class="ma0 pa0 fw4 lh-title flex flex-column w-100">
                      Credits
                      <small class=${this.local.credits < 0.128 ? 'red' : ''}>${this.local.credits}</small>
                    </h3>
                    ${button({
                      onClick: (e) => { this.local.machine.emit('creditsDialog:open') },
                      style: 'blank',
                      text: 'Add credits',
                      iconName: 'add-fat',
                      outline: true
                    })}
                  </li>
                  <li>
                    ${this.state.cache(ThemeSwitcher, 'theme-switcher-header').render()}
                  </li>
                  <li>
                    ${button({
                      onClick: (e) => this.local.machine.emit('logoutDialog:open'),
                      style: 'blank',
                      text: 'Log out',
                      outline: true
                    })}
                  </li>
                </ul>
              </li>
            </ul>
          </nav>
        `
      }

      return html`
        <nav role="navigation" aria-label="Main navigation" class="flex w-100 flex-auto justify-end-l">
          <ul class="${!this.state.resolved ? 'dn' : 'flex'} list ma0 pa0 w-100 w-auto-l justify-around justify-left-l items-center mr3-l">
            <li class="mr3">
              <a class="link db b dark-gray dark-gray--light gray--dark pv2 ph3" href="/login">Login</a>
            </li>
            <li>
              <a class="${fg} link db b pv2 ph3" target="_blank" rel="noopener" href="https://${process.env.OAUTH2_SERVER_DOMAIN}/join">Join</a>
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
    }[this.local.machine.state.browse] || renderDefault

    return html`
      <header role="banner" class="bg-black white fixed sticky-l left-0 top-0-l bottom-0 right-0 w-100 z-9999 flex items-center" style="height:3rem">
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
      const baseHref = `/u/${this.state.user.uid}-${this.state.user.nicename}/library`
      const items = {
        library: [
          {
            href: baseHref + '/favorites',
            text: 'Favorites'
          },
          {
            href: baseHref + '/collection',
            text: 'Collection'
          },
          {
            href: baseHref + '/playlists',
            text: 'Playlists'
          },
          {
            href: baseHref + '/history',
            text: 'History'
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
          }
        ]
      }[name]

      const closeButton = button({
        prefix: 'w3 h-100',
        onClick: () => machine.emit(eventName),
        title: 'Close menu',
        justifyCenter: true,
        style: 'blank',
        size: 'md',
        iconName: 'close',
        iconSize: 'xs'
      })

      return html`
        <div class="flex flex-auto items-center w-100 relative">
          <nav class="flex flex-auto w-100">
            <ul class="menu flex w-100 list ma0 pa0">
              ${items.map(({ text, href }) => {
                const active = this.state.href === href

                return html`
                  <li class="flex flex-auto justify-center relative ${active ? 'active' : ''}">
                    <a href=${href} class="link db b gray pv2 ph3">${text}</a>
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
