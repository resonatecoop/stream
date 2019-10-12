const Component = require('choo/component')
const nanostate = require('nanostate')
const nanologger = require('nanologger')
const html = require('choo/html')
const icon = require('@resonate/icon-element')
const { iconFillInvert } = require('@resonate/theme-skins')
const { isBrowser } = require('browser-or-node')

class ThemeSwitcher extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state
    this.local = state.components[id] = {}

    if (isBrowser) {
      this.local.auto = window.localStorage.getItem('color-scheme-auto') === 'true'
    }

    this.log = nanologger(id)

    this.machine = nanostate.parallel({
      theme: nanostate(this.state.theme, {
        dark: { toggle: 'light' },
        light: { toggle: 'dark' }
      })
    })

    this.machine.on('theme:toggle', () => {
      this.log.info('theme:toggle', this.machine.state.theme)
      this.emit('theme', { theme: this.machine.state.theme, auto: this.local.auto })
      this.rerender()
    })

    this._handleKeyPress = this._handleKeyPress.bind(this)
    this._handleChange = this._handleChange.bind(this)
    this._handleAutoChange = this._handleAutoChange.bind(this)
  }

  createElement () {
    return html`
      <div class="theme-switcher-component flex flex-column w-100">
        <form>
          <div class="flex w-100">
            <div class="flex items-center flex-auto">
              <input tabindex="-1" type="radio" disabled=${!!this.local.auto} name="theme" checked=${this.machine.state.theme === 'dark'} id="chooseDark" onchange=${this._handleChange} value="dark">
              <label tabindex="0" onkeypress=${this._handleKeyPress} class="flex flex-auto items-center justify-center w-100" for="chooseDark">
                <div class="pa3 flex justify-center w-100 flex-auto">
                  ${icon('circle', { class: `icon icon--sm ${iconFillInvert}` })}
                </div>
                <div class="pv3 flex w-100 flex-auto">
                  Dark
                </div>
              </label>
            </div>
            <div class="flex items-center flex-auto">
              <input tabindex="-1" type="radio" disabled=${!!this.local.auto} name="theme" checked=${this.machine.state.theme === 'light'} id="chooseLight" onchange=${this._handleChange} value="light">
              <label tabindex="0" onkeypress=${this._handleKeyPress} class="flex flex-auto items-center justify-center w-100" for="chooseLight">
                <div class="pa3 flex justify-center w-100 flex-auto">
                  ${icon('circle', { class: `icon icon--sm ${iconFillInvert}` })}
                </div>
                <div class="pv3 flex w-100 flex-auto">
                  Light
                </div>
              </label>
            </div>
            <div class="flex items-center flex-auto">
              <input tabindex="-1" type="checkbox" name="theme" checked=${!!this.local.auto} id="chooseAuto" onchange=${this._handleAutoChange} value="auto">
              <label tabindex="0" class="flex flex-auto items-center justify-center w-100" for="chooseAuto">
                <div class="pa3 flex justify-center w-100 flex-auto">
                  ${icon('square', { class: `icon icon--sm ${iconFillInvert}` })}
                </div>
                <div class="pv3 lex w-100 flex-auto">
                  Auto
                </div>
              </label>
            </div>
          </div>
        </form>
      </div>
    `
  }

  _handleAutoChange () {
    this.local.auto = !this.local.auto
    this.rerender()
    this.emit('theme', { theme: this.machine.state.theme, auto: this.local.auto })
  }

  _handleChange (e) {
    return (this.machine.state.theme !== e.target.value) && this.machine.emit('theme:toggle')
  }

  _handleKeyPress (e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.target.control.checked = !e.target.control.checked
      return (this.machine.state.theme !== e.target.control.value) && this.machine.emit('theme:toggle')
    }
    return false
  }

  update () {
    return false
  }
}

module.exports = ThemeSwitcher
