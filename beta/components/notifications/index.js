const Component = require('choo/component')
const compare = require('nanocomponent/compare')
const html = require('choo/html')
const morph = require('nanomorph')
const clone = require('shallow-clone')
const icon = require('@resonate/icon-element')
const { foreground: fg, bordersInvert: borders } = require('@resonate/theme-skins')

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
      <div class="notifications-component fixed w-100 w-75-l flex flex-auto z-max">
        ${this.renderNotifications()}
      </div>
    `
  }

  renderNotifications () {
    return html`
      <ul class="list flex flex-auto flex-column ma0 pa0">
        ${this.local.items.map(({ type = 'info', message }) => {
          if (!message) return

          const iconName = {
            success: 'check'
          }[type] || 'info'

          const iconFill = {
            warning: 'fill-red',
            error: 'fill-red'
          }[type]

          return html`
            <li class="${fg} ${borders} ba bw1 flex flex-auto items-center tc pv1 ph3 mb2 message ${type}">
              <span class="flex items-center justify-center h3 w3">
                ${icon(iconName, { class: iconFill, size: 'sm' })}
              </span>
              <p class="lh-copy pl2 f5">${message}</p>
            </li>
          `
        })}
      </ul>
      `
  }

  add (notification) {
    const { timeout = 3000, message } = notification

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
