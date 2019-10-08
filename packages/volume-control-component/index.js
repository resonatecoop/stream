const html = require('nanohtml')
const Component = require('nanocomponent')
const rangeSlider = require('@resonate/rangeslider')
const button = require('@resonate/button')
const nanostate = require('nanostate')
const { background } = require('@resonate/theme-skins')
const Nanobounce = require('nanobounce')
const nanobounce = Nanobounce(300)

/**
 * Volume control using rangeslider-js (vertical)
 */

class VolumeControl extends Component {
  constructor (id, state, emit) {
    super()

    this.state = state
    this.emit = emit

    this.local = state.components[id] = {}

    this.local.progress = 100

    this._createSlider = this._createSlider.bind(this)

    this._handleMouseEnter = this._handleMouseEnter.bind(this)
    this._handleMouseLeave = this._handleMouseLeave.bind(this)
    this._handleClick = this._handleClick.bind(this)

    this.machine = nanostate.parallel({
      volume: nanostate('off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      })
    })

    this.machine.on('volume:toggle', () => {
      const volumeControl = this.element.querySelector('.volume-control')

      if (this.machine.state.volume === 'off') {
        volumeControl.style.zIndex = '-1'
        volumeControl.style.bottom = '-100%'
        volumeControl.classList.add('o-0')
      }
      if (this.machine.state.volume === 'on') {
        volumeControl.classList.remove('o-0')
        volumeControl.style.bottom = '100%'
        volumeControl.style.zIndex = '5'

        if (document.body.classList.contains('user-is-tabbing')) {
          const input = this.element.querySelector('input')
          input.focus()
        } else {
          const button = this.element.querySelector('button')
          button.focus()
        }
      }
    })
  }

  _createSlider (el) {
    rangeSlider.create(el, {
      min: 0,
      max: 100,
      value: this.local.progress,
      step: 1,
      vertical: this.local.vertical,
      onSlide: (value, percent, position) => {
        const rangeSlider = this.element.querySelector('.rangeSlider')

        if (rangeSlider) {
          rangeSlider.classList.toggle('js-rangeslider__sliding', true)
        }

        this.local.progress = value

        this._onSlide(value, percent, position)
      },
      onSlideEnd: (value, percent, position) => {
        const rangeSlider = this.element.querySelector('.rangeSlider')

        if (rangeSlider) {
          rangeSlider.classList.toggle('js-rangeslider__sliding', false)
        }
      }
    })

    return el.rangeSlider
  }

  createElement (props) {
    const {
      vertical = true,
      volume = 1,
      onSlide = () => {}
    } = props

    this.local.progress = volume * 100
    this.local.vertical = vertical

    this._onSlide = onSlide

    const attrs = {
      type: 'range',
      id: 'slider',
      min: 0,
      max: 100,
      value: 0
    }

    return html`
      <div class="flex w-100">
        <div class="relative" onmouseenter=${this._handleMouseEnter} onmouseleave=${this._handleMouseLeave}>
          ${button({
            iconName: 'volume',
            onClick: this._handleClick,
            prefix: 'grow',
            size: 'medium',
            style: 'blank',
            title: 'Volume'
          })}
          <div class="volume-control ${background} shadow-contour w-100 absolute h4 o-0" style="z-index:-1;bottom:-100%;margin-bottom:1px;">
            <input ${attrs}>
          </div>
        </div>
      </div>
    `
  }

  _handleClick () {
    this.machine.emit('volume:toggle')
  }

  _handleMouseLeave (e) {
    return nanobounce(() => {
      if (this.machine.state.volume === 'on') {
        this.machine.emit('volume:toggle')
      }
    })
  }

  _handleMouseEnter (e) {
    return nanobounce(() => {
      if (this.machine.state.volume === 'off') {
        this.machine.emit('volume:toggle')
      }
    })
  }

  load (el) {
    const slider = this.element.querySelector('#slider')

    this.slider = this._createSlider(slider)
  }

  update () {
    return false
  }
}

module.exports = VolumeControl
