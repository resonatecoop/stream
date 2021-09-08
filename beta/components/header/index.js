const html = require('choo/html')
const Component = require('choo/component')
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
const imagePlaceholder = require('@resonate/svg-image-placeholder')

const logger = require('nanologger')
const log = logger('header')

const { loadStripe } = require('@stripe/stripe-js')

const { background: bg } = require('@resonate/theme-skins')

class Header extends Component {
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
        if (input && input !== document.activeElement) input.focus()
      }
      document.body.classList.toggle('search-open', this.local.machine.state.search === 'on')
    })

    this.local.machine.on('creditsDialog:open', async () => {
      const status = cookies.get('cookieconsent_status')

      if (status !== 'allow') {
        this.local.machine.emit('creditsDialog:close')

        return emit('cookies:openDialog')
      }

      if (!this.state.stripe) {
        try {
          this.state.stripe = await loadStripe(process.env.STRIPE_TOKEN)
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
            emit('logout', false)
            window.location = '/api/v2/user/logout'
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
      const avatar = this.state.user.avatar || {}
      const fallback = avatar.small || imagePlaceholder(60, 60) // v1 or undefined
      const src = avatar['profile_photo-sm'] || fallback // v2
      const user = this.state.user || { ownedGroups: [] }

      const displayName = user.ownedGroups.length ? user.ownedGroups[0].displayName : user.nickname
      const accountType = {
        user: 'Listener',
        artist: 'Artist',
        label: 'Label'
      }[user.role]

      return html`
        <nav role="navigation" aria-label="Main navigation" class="dropdown-navigation flex w-100 flex-auto justify-end-l">
          <ul class="flex list ma0 pa0 w-100 w-75-l justify-around items-center mr3-l" role="menu">
            <li class="flex flex-auto w-100 justify-center relative${/artists|labels/.test(this.state.href) ? ' active' : ''}" role="menuitem">
              <a href="/artists" class="dn db-l link near-black near-black--light near-white--dark pv2 ph3">Browse</a>
              <button class="db dn-l bg-transparent bn near-black near-black--light near-white--dark pa0" title="Open Browse Menu" onclick=${(e) => this.local.machine.emit('browse:toggle')} >
                <span class="flex justify-center items-center">
                  Browse
                </span>
              </button>
            </li>
            <li class="flex flex-auto w-100 justify-center relative${this.state.href === '/discover' ? ' active' : ''}" role="menuitem">
              <a href="/discover" class="link db near-black near-black--light near-white--dark pv2 ph3">Discover</a>
            </li>
            <li class="flex w-100 justify-center clip-l" role="menuitem">
              <button onclick=${() => this.local.machine.emit('search:toggle')} class="dn-l bn bg-transparent pa0">
                ${icon('search', { size: 'sm' })}
              </button>
            </li>
            ${this.state.user.uid
              ? html`
                <li class="flex flex-auto w-100 justify-center relative${this.state.href.includes('library') ? ' active' : ''}" role="menuitem">
                  <a href="/u/${this.state.user.uid}/library/favorites" class="link dn db-l near-black near-black--light near-white--dark pv2 ph3">Library</a>
                  <button class="db dn-l bg-transparent bn near-black near-black--light near-white--dark pa0" title="Open Library Menu" onclick=${(e) => this.local.machine.emit('library:toggle')} >
                    <span class="flex justify-center items-center">
                      Library
                    </span>
                  </button>
                </li>
              `
              : html`<li class="flex flex-auto w-100 justify-center" role="divider"></li>`}
            <li class="${this.state.resolved && !this.state.user.uid ? 'flex' : 'dn'} flex-auto justify-center w-100 grow" role="menuitem">
              <a class="link pv1 ph3 ttu ba b--mid-gray b--dark-gray--dark db f6 b" href="https://${process.env.APP_DOMAIN}/api/v2/user/connect/resonate">
                Log In
              </a>
            </li>
            <li class="${this.state.resolved ? 'dn' : 'flex'} flex-auto w-100 justify-center" role="divider"></li>
            <li class="${!this.state.user.uid ? 'dn' : 'flex'} flex-auto justify-center w-100" role="menuitem">
              <button title="Open menu" class="bg-transparent bn dropdown-toggle w-100 pa2 grow">
                <span class="flex justify-center items-center">
                  <div class="fl w-100 mw2">
                    <div class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray bg-dark-gray--dark">
                      <figure class="ma0">
                        <img src=${src} width=60 height=60 class="aspect-ratio--object z-1" />
                        <figcaption class="clip">${this.state.user.login}</figcaption>
                      </figure>
                    </div>
                  </div>
                  <div class="ph2">
                    ${icon('caret-down', { size: 'xxs' })}
                  </div>
                </span>
              </button>
              <ul class="${bg} ba bw b--mid-gray b--mid-gray--light b--near-black--dark list ma0 pa0 absolute right-0 dropdown z-999" style="width:100vw;left:auto;max-width:18rem;margin-top:-1px;" role="menu">
                <li role="menuitem" class="pt3">
                  <a href="${process.env.OAUTH_HOST}/account-settings" title="Account settings" class="link flex flex-auto items-center ph3 dim">
                    <span class="b">${displayName}</span>
                    <div class="flex flex-auto justify-end">
                      <span class="br-pill pv1 ph2 bg-light-gray bg-light-gray--light bg-near-black--dark">${accountType}</span>
                    </div>
                  </a>
                </li>
                <li class="bb bw b--mid-gray b--mid-gray--light b--near-black--dark mv3" role="separator"></li>
                <li class="${!this.state.user.uid ? 'dn' : 'flex'} items-center ph3" role="menuitem" onclick=${(e) => { e.stopPropagation(); this.local.machine.emit('creditsDialog:open') }}>
                  <div class="flex flex-column">
                    <label for="credits">Credits</label>
                    <input disabled tabindex="-1" name="credits" type="number" value=${this.local.credits} readonly class="bn br0 bg-transparent b ${this.local.credits < 0.128 ? 'red' : ''}">
                  </Div>
                  <div class="flex flex-auto justify-end">
                    <button onclick=${(e) => { e.stopPropagation(); this.local.machine.emit('creditsDialog:open') }} type="button" style="outline:solid 1px var(--near-black);outline-offset:-1px" class="pv2 ph3 ttu near-black near-black--light near-white--dark bg-transparent bn bn b flex-shrink-0 f6 grow">Add credits</button>
                  </div>
                </li>
                <li class="bb bw b--mid-gray b--mid-gray--light b--near-black--dark mt3 mb2" role="separator"></li>
                <li class="mb1" role="menuitem">
                  ${this.state.cache(ThemeSwitcher, 'theme-switcher-header').render()}
                </li>
                <li class="bb bw b--mid-gray b--mid-gray--light b--near-black--dark mv2" role="separator"></li>
                <li class="mb1" role="menuitem">
                  <a class="link db pv2 pl3" href="/faq">FAQ</a>
                </li>
                <li class="mb1" role="menuitem">
                  <a class="link db pv2 pl3" target="blank" rel="noreferer noopener" href="https://resonate.is/support">Support</a>
                </li>
                <li class="mb1" role="menuitem">
                  <a class="link db pv2 pl3" href="/settings">Settings</a>
                </li>
                <li class="bb bw b--mid-gray b--mid-gray--light b--near-black--dark mb3" role="separator"></li>
                <li class="${!this.state.user.uid ? 'dn' : ''} pr3 pb3" role="menuitem">
                  <div class="flex justify-end">
                    ${button({
                      prefix: 'ttu near-black near-black--light near-white--dark f6 ba b--mid-gray b--mid-gray--light b--dark-gray--dark',
                      onClick: (e) => this.local.machine.emit('logoutDialog:open'),
                      style: 'blank',
                      text: 'Log out',
                      outline: true
                    })}
                  </div>
                </li>
              </ul>
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
      <header role="banner" class="bg-white black bg-white--light black--light bg-black--dark white--dark white fixed sticky-l left-0 top-0-l bottom-0 right-0 w-100 z-9999 flex items-center bb bw b--mid-gray b--mid-gray--light b--near-black--dark" style="height:3rem">
        <nav role="navigation" class="relative dropdown-navigation--focus">
          <ul role="menu" class="list ma0 pa0 dn relative-l flex-l">
            <li>
              ${link({
                href: '/discover',
                text: icon('logo'),
                onClick: e => {
                  e.preventDefault()

                  this.emit(this.state.events.PUSHSTATE, this.state.user.uid ? '/discover' : '/')
                },
                prefix: 'link flex items-center flex-shrink-0 h-100 ph2 ml2',
                title: 'Resonate'
              })}
            </li>
            <li class="flex flex-auto w-100 justify-center">
              <button title="Open learn menu" class="bg-transparent near-black near-black--light near-white--dark bn dropdown-toggle grow pa3">
                <div class="flex justify-center items-center">
                  <span>Learn</span>
                  <div class="ph2">${icon('caret-down', { size: 'xxs' })}</div>
                </div>
              </button>
              <ul role="menu" class="${bg} ba bw b--mid-gray b--mid-gray--light b--near-black--dark list ma0 pa0 absolute right-0 dropdown z-999" style="left:0;margin-top:-1px;width:120px;">
                <li>
                  <a class="link db w-100 ph3 pv2 bg-animate hover-bg-light-gray hover-bg-light-gray--light hover-bg-dark-gray--dark" href="https://resonate.coop/about" target="_blank">About</a>
                </li>
                <li>
                  <a class="link db w-100 ph3 pv2 bg-animate hover-bg-light-gray hover-bg-light-gray--light hover-bg-dark-gray--dark" href="https://resonate.coop/pricing" target="_blank">Pricing</a>
                </li>
                <li>
                  <a class="link db w-100 ph3 pv2 bg-animate hover-bg-light-gray hover-bg-light-gray--light hover-bg-dark-gray--dark" href="https://resonate.coop/the-co-op" target="_blank">The Co-op</a>
                </li>
                <li>
                  <a class="link db w-100 ph3 pv2 bg-animate hover-bg-light-gray hover-bg-light-gray--light hover-bg-dark-gray--dark" href="https://resonate.coop/handbook" target="_blank">Handbook</a>
                </li>
                <li>
                  <a class="link db w-100 ph3 pv2 bg-animate hover-bg-light-gray hover-bg-light-gray--light hover-bg-dark-gray--dark" href="https://community.resonate.coop" target="_blank">Forum</a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
        ${subMenu()}
      </header>
    `
  }

  renderSubMenuItems ({ name = 'library', eventName }, machine) {
    return () => {
      const baseHref = `/u/${this.state.user.uid}/library`
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
            text: 'Artists',
            href: '/artists'
          },
          {
            text: 'Labels',
            href: '/labels'
          },
          {
            text: 'Releases',
            href: '/releases'
          },
          {
            text: 'Tracks',
            href: '/tracks'
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
                    <a href=${href} class="link db near-black near-white--dark near-black--light pv2 ph3">${text}</a>
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
          class: 'js bn dn db-l bg-transparent'
        }
        return html`
          <button ${attrs}>
            <div class="flex items-center">
              ${icon('search', { size: 'sm' })}
              <span class="db pl3 near-black near-black--light near-white--dark">Search</span>
            </div>
          </button>
        `
      }
    }[this.local.machine.state.search]

    return html`
      <div class="search flex-l flex-auto-l w-100-l justify-center-l">
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
