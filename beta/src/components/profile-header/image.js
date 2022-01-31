const html = require('choo/html')
const Component = require('choo/component')
const imagePlaceholder = require('@resonate/svg-image-placeholder')

class ProfileHeaderImage extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit
    this.local = {}
  }

  createElement (props) {
    this.local.images = props.images || {}
    this.local.name = props.name

    const cover = this.local.images['cover_photo-l'] || this.local.images.cover_photo || imagePlaceholder(1100, 260)

    return html`
      <figure class="ma0 db aspect-ratio aspect-ratio--110x26 bg-dark-gray">
        <span role="img" class="aspect-ratio--object cover" style="background:url(${cover}) center no-repeat"></span>
        <figcaption class="clip">${this.local.name} cover image</figcaption>
      </figure>
    `
  }

  update (props) {
    return this.local.images !== props.images
  }
}

module.exports = ProfileHeaderImage
