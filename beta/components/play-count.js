const html = require('choo/html')
const PlayCount = require('@resonate/play-count')
const renderCounter = () => html`
  <svg class="counter" viewbox="0 0 100 100" width="100" height="100">
    <circle cx="10" cy="10" r="10" fill="#909090" />
    <circle cx="50" cy="10" r="10" fill="#909090" />
    <circle cx="90" cy="10" r="10" fill="#909090" />
    <circle cx="10" cy="50" r="10" fill="#909090" />
    <circle cx="50" cy="50" r="10" fill="#909090" />
    <circle cx="90" cy="50" r="10" fill="#909090" />
    <circle cx="10" cy="90" r="10" fill="#909090" />
    <circle cx="50" cy="90" r="10" fill="#909090" />
    <circle cx="90" cy="90" r="10" fill="#909090"/>
  </svg>
`
const Nanocomponent = require('nanocomponent')

class Playcount extends Nanocomponent {
  constructor (name, state, emit) {
    super(name)

    this.props = {
      count: 9,
      name: 'counter',
      options: {}
    }
    this.state = {}
  }

  createElement (props) {
    this.state.name = props.name
    this.state.count = props.count
    this.state.options = props.options
    const counter = renderCounter()
    const playCount = new PlayCount(this.state.count, this.state.options)
    playCount.counter = counter
    playCount.circles = counter.querySelectorAll('circle')

    this.state.playCount = playCount
    this.state.counter = playCount.counter

    return html`
      <div id=${this.state.name}>
        ${this.state.counter}
      </div>
    `
  }

  unload () {
    this.state.playCount.stop()
    this.state.playCount.options.animate = false
  }

  update (props) {
    return props.count !== this.state.count
  }
}

module.exports = Playcount
