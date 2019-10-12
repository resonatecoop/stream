const html = require('choo/html')
const Component = require('choo/component')

class ProfileHeaderImage extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit
    this.local = {}
  }

  createElement (props) {
    this.local.cover = props.cover
    this.local.name = props.name

    return html`
      <figure class="ma0 db aspect-ratio" style="padding-top:calc(520 / 2480 * 100%)">
        <span role="img" aria-label="" style=${this.local.cover ? `background: var(--dark-gray) url(${this.local.cover}) center / cover no-repeat` : ''} class="bg-near-black bg-center z-1 cover aspect-ratio--object"></span>
        <figcaption class="clip">${this.local.name} cover image</figcaption>
      </figure>
    `
  }

  update (props) {
    return this.local.cover !== props.cover
  }
}

module.exports = ProfileHeaderImage
