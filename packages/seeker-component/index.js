const html = require('nanohtml')
const Nanocomponent = require('nanocomponent')
const assert = require('assert')
const rangeSlider = require('@resonate/rangeslider')

/*
 * Seeker using rangeslider-js
 */

class Seeker extends Nanocomponent {
  constructor (name, state, emit) {
    super(name)

    this.state = state
    this.emit = emit

    this._sound = null
    this._progress = 0
    this._onSlide = this._onSlide.bind(this)
    this._onSlideEnd = this._onSlideEnd.bind(this)
    this._createSeeker = this._createSeeker.bind(this)
  }

  _createSeeker (el) {
    rangeSlider.create(el, {
      min: 0,
      max: 100,
      value: this._progress,
      step: 0.0001,
      onSlide: this._onSlide,
      onSlideEnd: this._onSlideEnd
    })

    return el.rangeSlider
  }

  set sound (props) {
    this._sound = props.sound
  }

  get progress () {
    return this._progress
  }

  set progress (progress) {
    this._progress = progress
  }

  createElement (props) {
    assert.strictEqual(typeof props.progress, 'number', 'Seeker: progress must be a number')

    this._sound = props.sound
    this._progress = props.progress

    if (!this.slider) {
      this._element = html`
        <div unresolved="unresolved" class="seeker h-100">
          <input id="seeker" type="range" />
        </div>
      `
    }

    return this._element
  }

  _onSlide (value, percent, position) {
    this.element.querySelector('.rangeSlider').classList.toggle('js-rangeslider__sliding', true)
    this._progress = value
    if (this._sound) {
      this._sound.mute()
      this._sound.seek(percent)
    }
  }

  _onSlideEnd (value, percent, position) {
    if (this._sound) {
      this._sound.unmute()
    }
    this.element.querySelector('.rangeSlider').classList.toggle('js-rangeslider__sliding', false)
  }

  load (el) {
    el.removeAttribute('unresolved')
    this.slider = this._createSeeker(el.querySelector('#seeker'))
  }

  update (progress) {
    return progress !== this._progress
  }
}

module.exports = Seeker
