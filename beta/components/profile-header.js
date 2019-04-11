const Nanocomponent = require('nanocomponent')
const html = require('choo/html')

/*
 * Generic profile header for all types of users
 */

class ProfileHeader extends Nanocomponent {
  constructor (name, state, emit) {
    super(name)

    this.state = state
    this.emit = emit

    this.state = {
      data: null
    }
  }

  createElement (props) {
    this.state.data = props.data

    const { avatar: image = {}, name, country } = props.data
    const fallback = image['original'] || '/assets/default.png'
    const { large = fallback } = image

    return html`
      <div class="bg-near-white black bg-black--dark white--dark bg-near-white--light black--light flex flex-auto items-center">
        <div class="cf w4 ma3">
          <div class="db aspect-ratio aspect-ratio--1x1 bg-near-black b--near-white b--black--dark b-near-white--light ba bw z-1">
            <img aria-label=${name} src=${large} decoding="auto" class="aspect-ratio--object">
          </div>
        </div>
        <div>
          <h2 class="lh-title flex flex-column">
            ${name}
            <small class="lh-copy f7">${country}</small>
          </h2>
        </div>
      </div>
    `
  }

  renderLabel (props) {
    const { label } = props

    if (!label) return

    return html`
      <p class="f7 ma0">
        Label: <a href="/labels/${label.id}" class="color-inherit dim no-underline">
          ${label.name}
        </a>
      </p>
    `
  }

  update (props) {
    return props.data.id !== this.state.data.id ||
      props.data.uid !== this.state.data.uid
  }
}

module.exports = ProfileHeader
