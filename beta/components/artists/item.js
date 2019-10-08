const Component = require('choo/component')
const html = require('choo/html')

class Artist extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit
    this.local = {}
  }

  createElement (props) {
    const { avatar: image = {}, id, name } = props
    const fallback = image.original || '/assets/default.png'
    const { large = fallback } = image

    return html`
      <a class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray bg-dark-gray--dark" href="/artists/${id}">
        <img title=${name} src=${large} decoding="auto" class="aspect-ratio--object">
        <span class="absolute bottom-0 truncate w-100 h2" style="top:100%;">
          ${name}
        </span>
      </a>
    `
  }

  update () {
    return true
  }
}

module.exports = Artist
