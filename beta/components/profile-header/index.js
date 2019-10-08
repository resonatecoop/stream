const Component = require('choo/component')
const html = require('choo/html')

/*
 * Generic profile header for all types of users
 */

class ProfileHeader extends Component {
  constructor (id, state, emit) {
    super(id)

    this.local = state.components[id] = {}
    this.state = state
    this.emit = emit
  }

  createElement (props) {
    this.local.data = props.data

    const { avatar: image = {}, name, country } = props.data
    const fallback = image.original || '/assets/default.png'
    const { large = fallback } = image

    return html`
      <div class="flex flex-auto pa3">
        <div class="cf w4">
          <div class="db aspect-ratio aspect-ratio--1x1 bg-near-black z-1">
            <img title=${name} src=${large} decoding="auto" class="aspect-ratio--object">
          </div>
        </div>
        <h2 class="lh-title mt0 ml3 f3 flex flex-column">
          ${name}
          <small class="lh-copy mt2 f5">${country}</small>
        </h2>
      </div>
    `
  }

  update (props) {
    return props.data.id !== this.local.data.id
  }
}

module.exports = ProfileHeader
