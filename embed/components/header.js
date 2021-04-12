const Component = require('choo/component')
const html = require('choo/html')
const icon = require('@resonate/icon-element')
const link = require('@resonate/link-element')

class Header extends Component {
  constructor (id, state, emit) {
    super(id)

    this.local = state.components[id] = {}
    this.state = state
    this.emit = emit
  }

  createElement (props) {
    this.local.href = props.href

    return html`
      <header role="banner" class="bg-black shadow-contour white sticky left-0 top-0 right-0 w-100 z-9999 flex items-center" style="height:3rem">
        ${link({
          href: process.env.APP_HOSTNAME,
          target: '_blank',
          text: icon('logo', { class: 'fill-white' }),
          prefix: 'link flex items-center flex-shrink-0 h-100 ph2 ml2',
          title: 'Resonate'
        })}
      </header>
    `
  }

  update (props) {
    return this.local.href !== props.href
  }
}

module.exports = Header
