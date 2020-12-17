const html = require('choo/html')
const Component = require('choo/component')
const icon = require('@resonate/icon-element')
const link = require('@resonate/link-element')
const { foreground: fg } = require('@resonate/theme-skins')

/**
 * Header unauthenticated only routes (home, login, ...)
 */

class HeaderOutside extends Component {
  constructor (id, state, emit) {
    super(id)

    this.local = state.components[id] = {}

    this.emit = emit
    this.state = state
  }

  createElement (props) {
    this.local.loggedIn = props.loggedIn
    this.local.href = props.href

    return html`
      <header role="banner" class="sticky top-0 w-100 z-9999 flex items-center" style="height:3rem">
        ${link({
          href: '/',
          text: icon('logo', { size: 'md' }),
          prefix: 'link flex items-center flex-shrink-0 h-100 ph2 ml2',
          title: 'Resonate'
        })}
        <nav role="navigation" aria-label="Main navigation" class="flex w-100 flex-auto justify-end">
          ${this.local.loggedIn ? html`
          <ul class="list ma0 pa0 flex justify-around items-center mr3">
            <li class="mr3">
              <a class="link db b dark-gray dark-gray--light white--dark pv2 ph3" href="/discovery">Listen</a>
            </li>
          </ul>
          ` : html`
          <ul class="list ma0 pa0 flex justify-around items-center mr3">
            <li class="mr3">
              <a class="link db b dark-gray dark-gray--light gray--dark pv2 ph3" href="/login">Login</a>
            </li>
            <li>
              <a class="${fg} link db b pv2 ph3" target="_blank" rel="noopener" href="https://${process.env.OAUTH2_SERVER_DOMAIN}/join">Join</a>
            </li>
          </ul>`}
        </nav>
      </header>
    `
  }

  update (props) {
    return props.href !== this.local.href ||
      props.loggedIn !== this.local.loggedIn
  }
}

module.exports = HeaderOutside
