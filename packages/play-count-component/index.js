const html = require('choo/html')
const PlayCount = require('@resonate/play-count')
const renderCounter = require('@resonate/counter')
const Nanocomponent = require('nanocomponent')

class PlayCountComponent extends Nanocomponent {
  constructor (id, state, emit) {
    super(id)

    this.local = state.components[id] = {}

    this.local.count = 9
    this.local.options = {}
  }

  createElement (props) {
    this.local.count = props.count
    this.local.options = props.options

    const counter = renderCounter(this._name, { scale: 3, strokeWidth: 1 })
    this.playCount = new PlayCount(this.local.count, this.local.options)
    this.playCount.counter = counter

    if (this._hasWindow) {
      this.playCount.circles = counter.querySelectorAll('circle')
    }

    return html`
      <div id=${this._name}>
        ${this.playCount.counter}
      </div>
    `
  }

  unload () {
    this.playCount.stop()
    this.playCount.options.animate = false
  }

  update (props) {
    return props.count !== this.local.count
  }
}

module.exports = PlayCountComponent
