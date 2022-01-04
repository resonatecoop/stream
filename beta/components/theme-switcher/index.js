/* global localStorage */

const Component = require('choo/component')
const nanostate = require('nanostate')
const nanologger = require('nanologger')
const html = require('choo/html')
const icon = require('@resonate/icon-element')
const { iconFillInvert } = require('@resonate/theme-skins')

class ThemeSwitcher extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state
    this.local = state.components[id] = {}

    this.log = nanologger(id)

    this.local.machine = nanostate.parallel({
      theme: nanostate(this.state.theme || 'light', {
        dark: { toggle: 'light' },
        light: { toggle: 'dark' }
      })
    })

    this.local.machine.on('theme:toggle', () => {
      this.log.info('theme:toggle', this.local.machine.state.theme)
      this.emit('theme', { theme: this.local.machine.state.theme, auto: this.local.auto })
      this.rerender()
    })

    this._handleKeyPress = this._handleKeyPress.bind(this)
    this._handleChange = this._handleChange.bind(this)
    this._handleAutoChange = this._handleAutoChange.bind(this)
    this._handleAutoChangeKeyPress = this._handleAutoChangeKeyPress.bind(this)
  }

  createElement () {
    return html`
      <div class="theme-switcher-component flex flex-column w-100 pa2">
        <fieldset class="ma0 pa0 bn">
          <legend class="lh-copy f5 clip">Theme</legend>
          <div class="flex w-100">
            <div class="flex items-center flex-auto">
              <input tabindex="-1" type="radio" name="theme" checked=${this.local.machine.state.theme === 'dark'} id="chooseDark" onchange=${this._handleChange} value="dark">
              <label tabindex=${this.local.auto ? -1 : 0} onkeypress=${this._handleKeyPress} class="flex flex-auto items-center justify-center w-100" for="chooseDark">
                <div class="pv3 flex justify-center w-100 flex-auto">
                  ${icon('circle', { class: `icon icon--sm ${iconFillInvert}` })}
                </div>
                <div class="pv3 flex w-100 flex-auto">
                  Dark
                </div>
              </label>
            </div>
            <div class="flex items-center flex-auto">
              <input tabindex="-1" type="radio" name="theme" checked=${this.local.machine.state.theme === 'light'} id="chooseLight" onchange=${this._handleChange} value="light">
              <label tabindex=${this.local.auto ? -1 : 0} onkeypress=${this._handleKeyPress} class="flex flex-auto items-center justify-center w-100" for="chooseLight">
                <div class="pv3 flex justify-center w-100 flex-auto">
                  ${icon('circle', { class: `icon icon--sm ${iconFillInvert}` })}
                </div>
                <div class="pv3 flex w-100 flex-auto">
                  Light
                </div>
              </label>
            </div>
            <div class="flex items-center flex-auto">
              <input tabindex="-1" type="radio" name="theme" checked=${!!this.local.auto} id="chooseAuto" onchange=${this._handleAutoChange} value="auto">
              <label tabindex="0" onkeypress=${this._handleAutoChangeKeyPress} class="flex flex-auto items-center justify-center w-100" for="chooseAuto">
                <div class="pv3 flex justify-center w-100 flex-auto">
                  ${icon('circle', { class: `icon icon--sm ${iconFillInvert}` })}
                </div>
                <div class="flex flex-auto w-100 pv3">
                  Auto
                </div>
              </label>
            </div>
          </div>
        </fieldset>
      </div>
    `
  }

  load (el) {
    this.local.auto = localStorage !== null && !!localStorage.getItem('color-scheme-auto')
    this.rerender()
    if (
      window !== undefined &&
      window.matchMedia('(prefers-color-scheme: dark)') !== undefined &&
      window.matchMedia('(prefers-color-scheme: dark)').matches !== undefined && 
      window.matchMedia('(prefers-color-scheme: dark)').matches &&
      this.state.theme === 'light' &&
      this.local.auto
      ) {
        this.state.theme = 'dark'
        this.local.machine.emit('theme:toggle')
    }
  }

  _handleAutoChange () {
    this.local.auto = !this.local.auto
    this.rerender()
    this.emit('theme', {
      theme: this.local.machine.state.theme,
      auto: this.local.auto
    })
  }

  _handleAutoChangeKeyPress (e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      this._handleAutoChange()
    }
    return false
  }

  _handleChange (e) {
    if (e.target.value !== 'auto' && this.local.auto) {
      this._handleAutoChange(e)
    }

    if (this.local.machine.state.theme !== e.target.value) {
      this.local.machine.emit('theme:toggle')
    }
  }

  _handleKeyPress (e) {
    if (e.key === 'Enter') {
      e.preventDefault()

      if (e.target.value !== 'auto' && this.local.auto) {
        this._handleAutoChange(e)
      }

      if (!e.target.control.checked && this.local.machine.state.theme !== e.target.value) {
        e.target.control.checked = !e.target.control.checked
        this.local.machine.emit('theme:toggle')
      }
    }
    return false
  }

  update () {
    return false
  }
}

module.exports = ThemeSwitcher
