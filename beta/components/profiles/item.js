const Component = require('choo/component')
const imagePlaceholder = require('../../lib/image-placeholder')
const card = require('./card')

class ProfileItem extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit
  }

  createElement (props) {
    const { avatar: image = {}, images = {}, id, name } = props
    const fallback = image.large || image.original || imagePlaceholder(400, 400) // api v1
    const src = images['profile_photo-l'] || images['profile_photo-m'] || fallback

    const baseHref = {
      artists: '/artist',
      labels: '/label',
      'label/:id': '/artist', // display labels artists
      'artist/:id': '/label', // display member of,
      'label/:id/artists': '/artist' // display labels artists
    }[this.state.route]

    return card(baseHref + '/' + id, src, name)
  }

  update () {
    return false
  }
}

module.exports = ProfileItem
