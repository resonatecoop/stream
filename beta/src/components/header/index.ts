import Component from 'choo/component'
import icon from '@resonate/icon-element'
import nanostate from 'nanostate'
import button from '@resonate/button'
import Dialog from '@resonate/dialog-component'
import Search from '@resonate/search-component'
import link from '@resonate/link-element'
import ThemeSwitcher from '../theme-switcher'
import morph from 'nanomorph'
import imagePlaceholder from '@resonate/svg-image-placeholder'
import matchMediaCustom from '../../lib/match-media'
import { background as bg } from '@resonate/theme-skins'
import TAGS from '../../lib/tags'
import Nanobus from 'nanobus'
import { AppState } from '../../types'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

interface HeaderProps {
  resolved?: boolean
  href?: boolean
  credits?: number
  user?: {}
}

class Header extends Component<HeaderProps> {
  private local: HeaderProps & {
    machine: ReturnType<typeof nanostate.parallel>
  }

  private readonly emit: Nanobus['emit']
  private readonly state: AppState

  constructor (id: string, state: AppState, emit: Nanobus['emit']) {
    super(id)

    // @ts-expect-error
    this.local = state.components[id] = {}

    this.emit = emit
    this.state = state

    this.local.user = {}

    this.local.credits = 0

    this.local.machine = nanostate.parallel({
      library: nanostate('off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      }),
      browse: nanostate('off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      }),
      search: nanostate(matchMediaCustom('l') ? 'on' : 'off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      }),
      logoutDialog: nanostate('close', {
        open: { close: 'close' },
        close: { open: 'open' }
      })
    })

    this.local.machine.on('search:toggle', () => {
      morph(this.element?.querySelector('.search'), this.renderSearch())
      if (this.local.machine.state.search === 'on') {
        const input = document.querySelector<HTMLInputElement>('input[type="search"]')
        if (input && input !== document.activeElement) input.focus()
      }
      document.body.classList.toggle('search-open', this.local.machine.state.search === 'on')
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

  createElement (props): HTMLElement {
    this.local.credits = props.credits
    this.local.user = props.user ?? {}
    this.local.resolved = props.resolved
    this.local.href = props.href

    const mainMenu = (): HTMLElement => {
      const avatar = this.state.user?.avatar ?? {}
      const fallback = avatar.small ?? imagePlaceholder(60, 60) // v1 or undefined
      const src = avatar['profile_photo-sm'] ?? fallback // v2
      const user = this.state.user ?? { ownedGroups: [] }

      const displayName = user.ownedGroups.length ? user.ownedGroups[0].displayName : user.nickname

      const AUTH_HREF = process.env.AUTH_API === 'v2'
        ? `https://${process.env.APP_DOMAIN}/api/v2/user/connect/resonate`
        : '/login'

      return html`
        <nav role="navigation" aria-label="Main navigation" class="dropdown-navigation flex w-100 flex-auto justify-end-l">
          <ul class="flex list ma0 pa0 w-100 w-90-l justify-around items-center mr3" role="menu">
            <li class="flex flex-auto w-100 justify-center relative${/artists|labels|tracks|releases/.test(this.state.href) ? ' active' : ''}" role="menuitem">
              <a href="/artists" class="dn db-l link near-black near-black--light near-white--dark pv2 ph3">Browse</a>
              <a href="javascript:;" class="db dn-l link near-black near-black--light near-white--dark pv2 ph3" title="Open Browse Menu" onclick=${(e) => this.local.machine.emit('browse:toggle')} >
                  Browse
              </a>
            </li>
            <li class="flex flex-auto w-100 justify-center relative${this.state.href === '/discover' ? ' active' : ''}" role="menuitem">
              <a href="/discover" class="link db near-black near-black--light near-white--dark pv2 ph3">Discover</a>
            </li>
            ${this.state.user.uid
              ? html`
                <li class="flex flex-auto w-100 justify-center relative${this.state.href.includes('library') ? ' active' : ''}" role="menuitem">
                  <a href="/u/${this.state.user.uid}/library/favorites" class="link dn db-l near-black near-black--light near-white--dark pv2 ph3">Library</a>
                  <a href="javascript:;" class="db dn-l link near-black near-black--light near-white--dark pv2 ph3" title="Open Library Menu" onclick=${(e) => this.local.machine.emit('library:toggle')} >
                      Library
                  </a>
                </li>
              `
              : html`<li class="flex flex-auto w-100 justify-center" role="divider"></li>`}
            <li class="${this.state.resolved && !this.state.user.uid ? 'flex' : 'dn'} flex-auto justify-center w-100 grow" role="menuitem">
              <a class="link pv1 ph3 ttu ba b--mid-gray b--dark-gray--dark db f6 b" href=${AUTH_HREF} >
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
                        <!-- TODO: Previously state.user.login was read here, but it isn't set anywhere, so it will always be undefined -->
                        <figcaption class="clip">${undefined}</figcaption>
                      </figure>
                    </div>
                  </div>
                  <div class="ph2">
                    ${icon('caret-down', { size: 'xxs' })}
                  </div>
                </span>
              </button>
              <ul class="${bg} ba bw b--mid-gray b--mid-gray--light b--near-black--dark list ma0 pa0 absolute right-0 dropdown z-999 bottom-100 top-100-l" style="width:100vw;left:auto;max-width:18rem;margin-top:-1px;" role="menu">
                <li role="menuitem" class="pt3">
                  <div class="flex flex-auto items-center ph3">
                    <span class="b">${displayName}</span>
                  </div>
                </li>
                <li class="bb bw b--mid-gray b--mid-gray--light b--near-black--dark mv3" role="separator"></li>
                <li class="${!this.state.user.uid ? 'dn' : 'flex'} items-center ph3" role="menuitem">
                  <div class="flex flex-column">
                    <label for="credits">Credits</label>
                    <input disabled tabindex="-1" name="credits" type="number" value=${this.local.credits} readonly class="bn br0 bg-transparent b ${this.local.credits && this.local.credits < 0.128 ? 'red' : ''}">
                  </Div>
                  <div class="flex flex-auto justify-end">
                  </div>
                </li>
                <li class="bb bw b--mid-gray b--mid-gray--light b--near-black--dark mt3 mb2" role="separator"></li>
                <li class="mb1" role="menuitem">
                  ${this.state.cache(ThemeSwitcher, 'theme-switcher-header').render()}
                </li>
                <li class="bb bw b--mid-gray b--mid-gray--light b--near-black--dark mv2" role="separator"></li>
                <li class="mb1" role="menuitem">
                  <a class="link db pv2 pl3" target="_blank" href="${process.env.OAUTH_HOST}/account">Account</a>
                </li>
                <li class="mb1" role="menuitem">
                  <a class="link db pv2 pl3" href="/faq">FAQ</a>
                </li>
                <li class="mb1" role="menuitem">
                  <a class="link db pv2 pl3" target="blank" href="https://${process.env.SITE_DOMAIN}/support">Support</a>
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

    // Figure out which menu to render, only one can render at a time
    let menu
    if (this.local.machine.state.library === 'on') {
      menu = this.renderSubMenuItems({ name: 'library', eventName: 'library:toggle' }, this.local.machine)
    } else if (this.local.machine.state.browse === 'on') {
      menu = this.renderSubMenuItems({ name: 'browse', eventName: 'browse:toggle' }, this.local.machine)
    } else {
      menu = mainMenu()
    }

    const logoLinkOpts = {
      href: '/discover',
      text: icon('logo'),
      onClick: e => {
        e.preventDefault()

        this.emit(this.state.events.PUSHSTATE, this.state.user.uid ? '/discover' : '/')
      },
      prefix: 'link flex items-center flex-shrink-0 h-100 ph2 ml2 overflow-hidden',
      title: 'Resonate'
    }

    return html`
      <header role="banner" class="bg-white black bg-white--light black--light bg-black--dark white--dark white fixed sticky-l left-0 top-0-l bottom-0 right-0 w-100 z-9999 flex items-center bt bt-0-l bb-l bw b--mid-gray b--mid-gray--light b--near-black--dark" style="height:3rem">
        <nav role="navigation" class="relative dropdown-navigation--focus">
          <ul role="menu" class="list ma0 pa0 bg-white bg-white--light bg-black--dark bg-transparent-l fixed w-100 w-auto-l top-0 left-0 flex relative-l flex-l bb bb-0-l bw b--mid-gray b--mid-gray--light b--near-black--dark" style="height:3rem">
            <li role="menuitem">
              ${link(Object.assign({}, logoLinkOpts, {
                text: icon('logo-wordmark')
              }))}
            </li>
            <li class="flex flex-auto-l w-100-l justify-center" role="menuitem">
              <button title="Open learn menu" class="bg-transparent near-black near-black--light near-white--dark bn dropdown-toggle grow pa3">
                <div class="flex justify-center items-center">
                  <span>Learn</span>
                  <div class="ph2">${icon('caret-down', { size: 'xxs' })}</div>
                </div>
              </button>
              <ul role="menu" class="${bg} ba bw b--mid-gray b--mid-gray--light b--near-black--dark list ma0 pa0 absolute right-0 dropdown z-999 top-100" style="left:0;width:120px;">
                <li>
                  <a class="link db w-100 ph3 pv2 bg-animate hover-bg-light-gray hover-bg-light-gray--light hover-bg-dark-gray--dark" href="https://resonate.coop/about" target="_blank">About</a>
                </li>
                <li>
                  <a class="link db w-100 ph3 pv2 bg-animate hover-bg-light-gray hover-bg-light-gray--light hover-bg-dark-gray--dark" href="https://resonate.coop/pricing" target="_blank">Pricing</a>
                </li>
                <li>
                  <a class="link db w-100 ph3 pv2 bg-animate hover-bg-light-gray hover-bg-light-gray--light hover-bg-dark-gray--dark" href="https://resonate.coop/the-coop" target="_blank">The Co-op</a>
                </li>
                <li>
                  <a class="link db w-100 ph3 pv2 bg-animate hover-bg-light-gray hover-bg-light-gray--light hover-bg-dark-gray--dark" href="/faq">FAQ</a>
                </li>
                <li>
                  <a class="link db w-100 ph3 pv2 bg-animate hover-bg-light-gray hover-bg-light-gray--light hover-bg-dark-gray--dark" href="https://community.${process.env.SITE_DOMAIN}" target="_blank">Forum</a>
                </li>
              </ul>
            </li>
            <li class="flex w-100 justify-end clip-l" role="menuitem">
              <button onclick=${() => this.local.machine.emit('search:toggle')} class="dn-l mr4 bn bg-transparent pa0">
                <div class="flex items-center justify-center">
                  ${icon('search', { size: 'sm' })}
                </div>
              </button>
            </li>
          </ul>
        </nav>
        ${this.renderSearch()}
        ${menu}
      </header>
    `
  }

  renderSubMenuItems ({ name = 'library', eventName }, machine): HTMLElement {
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
    }[name] ?? []

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
          <ul class="flex w-100 list ma0 pa0" role="menu">
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

  renderSearch (): HTMLElement {
    const search = {
      on: () => this.state.cache(Search, 'search').render({ tags: TAGS }),
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
        ${search?.()}
      </div>
    `
  }

  update (props: HeaderProps): boolean {
    return props.credits !== this.local.credits ||
      props.href !== this.local.href ||
      props.resolved !== this.local.resolved
  }
}

export default Header
