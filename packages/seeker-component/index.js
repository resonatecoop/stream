const html = require('nanohtml')
const Nanocomponent = require('nanocomponent')
const assert = require('assert')
const rangeSlider = require('@resonate/rangeslider')

/**
 * Seeker using rangeslider-js
 */

class Seeker extends Nanocomponent {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit

    this.local = state.components[id] = {}
    this.local.progress = 0

    this._createSeeker = this._createSeeker.bind(this)
  }

  _createSeeker (el) {
    rangeSlider.create(el, {
      min: 0,
      max: 100,
      value: this.local.progress,
      step: 0.5,
      onSlide: (value, percent, position) => {
        if (this.element) {
          this.element.querySelector('.rangeSlider').classList.toggle('js-rangeslider__sliding', true)
        }

        this._onSlide(value, percent, position)
      },
      onSlideEnd: (value, percent, position) => {
        if (this.element) {
          this.element.querySelector('.rangeSlider').classList.toggle('js-rangeslider__sliding', false)
        }

        this._onSlideEnd(value, percent, position)
      }
    })

    return el.rangeSlider
  }

  createElement (props) {
    assert.strictEqual(typeof props.progress, 'number', 'Seeker: progress must be a number')

    this._onSlide = props.onSlide
    this._onSlideEnd = props.onSlideEnd

    this.local.progress = props.progress

    if (!this.slider) {
      const attrs = {
        type: 'range',
        id: 'seeker',
        min: 0,
        max: 100,
        value: 0,
        style: 'cursor: column-resize'
      }
      this._element = html`
        <div unresolved="unresolved" class="seeker h-100">
          <input ${attrs}>
        </div>
      `
    }

    return this._element
  }

  load (el) {
    el.removeAttribute('unresolved')

    this.slider = this._createSeeker(el.querySelector('#seeker'))
  }

  update () {
    return false
  }
}

module.exports = Seeker
