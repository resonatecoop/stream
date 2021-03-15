const Component = require('choo/component')
const html = require('choo/html')
const imagePlaceholder = require('@resonate/svg-image-placeholder')

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
    this.local.name = props.name

    const { images = {}, name, country } = props

    // 300x300, 400x400
    const src = images['profile_photo-m'] || images['profile_photo-l'] || images.profile_photo || imagePlaceholder(400, 400)

    return html`
      <div class="flex flex-column flex-row-l flex-auto pa3">
        <div class="w-100 flex flex-row flex-auto">
          <div class="cf w-100 mw4">
            <figure class="ma0 db aspect-ratio aspect-ratio--1x1 bg-dark-gray">
              <span role="img" class="aspect-ratio--object cover" style="background:url(${src}) center no-repeat"></span>
              <figcaption class="clip">${name} profile image</figcaption>
            </figure>
          </div>
          <h2 class="lh-title fw3 mt0 ml3 f3 flex flex-column">
            ${name}
            <small class="lh-copy mt2 f5">
              <a href="/search?q=country:${country}" onclick=${(e) => { e.preventDefault(); this.emit('search', `country:${country}`); return false }} class="link">
                ${country}
              </a>
            </small>
          </h2>
        </div>
        <div class="w-100 flex flex-auto">
        </div>
      </div>
    `
  }

  update (props) {
    return props.name !== this.local.name
  }
}

module.exports = ProfileHeader
