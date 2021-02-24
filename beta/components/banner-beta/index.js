const html = require('choo/html')
const Component = require('choo/component')
const link = require('@resonate/link-element')
const icon = require('@resonate/icon-element')

class Baneer extends Component {
  constructor (id, state, emit) {
    super(id)

    this.local = state.components[id] = {}
  }

  createElement () {
    return html`
      <div class="no-js relative">
        <noscript>
          <p class="f5 lh-copy pl3">
            For the best experience with Resonate, please ensure that your browser has ${link({
              href: 'https://www.enable-javascript.com',
              prefix: 'b',
              text: 'Javascript enabled',
              target: '_blank'
            })}.
          </p>
        </noscript>
        <p class="f5 lh-copy measure pl3">
          Welcome to the new Beta Player! <a class="link b underline" target="_blank" rel="noopener noreferer" href="https://resonate.is/new-beta-player-update">Read the blog post</a> for all details about this release.
        </p>
        <p class="f5 lh-copy pl3">
          Looking for something else ? ${link({
            href: '/faq',
            prefix: 'b',
            text: 'See frequently asked questions'
          })}.
        </p>
        <p class="f5 lh-copy pl3">
          Our team is here to help you. ${link({
            href: 'https://resonate.is/support',
            prefix: 'b',
            text: 'Get support',
            target: '_blank'
          })}.
        </p>
        <div class="absolute top-0 right-1 js" style="transform:translateX(-50%)">
          <button onclick=${() => {
            window.localStorage.setItem('BANNER_DISABLED', 1)
            this.element.parentNode.removeChild(this.element)
          }} class="grow bg-transparent bn br0">
            <div class="flex flex-column justify-center items-center">
              ${icon('close', { size: 'sm' })}
              <span class="f6 b ttu pv2">Close</span>
            </div>
          </button>
        </div>
      </div>
    `
  }

  load (el) {
    if (window.localStorage.getItem('BANNER_DISABLED')) {
      return el.parentNode.removeChild(el)
    }
    return el.classList.remove('no-js')
  }

  update () {
    return false
  }
}

module.exports = Baneer
