const Component = require('choo/component')
const compare = require('nanocomponent/compare')
const html = require('choo/html')
const morph = require('nanomorph')
const clone = require('shallow-clone')
const icon = require('@resonate/icon-element')
const { foreground: fg, iconFillInvert, bordersInvert: borders } = require('@resonate/theme-skins')

class Notifications extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit
    this.local = state.components[id] = {}
    this.local.items = []

    this._removeNotification = this._removeNotification.bind(this)
  }

  createElement (props) {
    const { items = [] } = props

    this.local.items = clone(items)

    return html`
      <div class="notifications-component fixed w-100 w-50-l flex flex-auto z-max">
        ${this.renderNotifications()}
      </div>
    `
  }

  renderNotifications () {
    const notifications = this.local.items.map(item => {
      const { type = 'info', message } = item
      const iconName = type === 'success' ? 'check' : 'info'

      return html`
        <li class="${fg} ${borders} ba bw1 flex flex-auto items-center tc pv1 mb2 message ${type}">
          <span class="flex items-center justify-center h3 w3">
            ${icon(iconName, { class: iconFillInvert, size: 'sm' })}
          </span>
          <p class="lh-copy pl2 f5">
            ${message}
          </p>
        </li>
      `
    })

    return html`
      <ul class="list flex flex-auto flex-column ma0 pa0">
        ${notifications}
      </ul>
      `
  }

  add (notification) {
    const { timeout = 3000, message = 'Hello World' } = notification

    this.local.items.push(notification)

    morph(this.element.querySelector('.list'), this.renderNotifications())

    setTimeout(
      this._removeNotification,
      timeout,
      message
    )
  }

  info (text) {
    this.add({ type: 'info', message: text })
  }

  error (text) {
    this.add({ type: 'error', message: text })
  }

  warning (text) {
    this.add({ type: 'warning', message: text })
  }

  success (text) {
    this.add({ type: 'success', message: text })
  }

  _removeNotification () {
    this.local.items.splice(0, 1)

    if (!this.element) return

    morph(this.element.querySelector('.list'), this.renderNotifications())

    if (!this.local.items.length) {
      const dialog = document.querySelector('dialog')
      const host = dialog || document.body
      if (host && host.parentNode === this.element) {
        host.removeChild(this.element)
      }
    }
  }

  update (props) {
    return compare(props.items, this.local.items)
  }
}

module.exports = Notifications
