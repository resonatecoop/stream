const Component = require('choo/component')
const html = require('choo/html')

class LabelItem extends Component {
  createElement (props) {
    const { avatar: image = {}, id, name } = props
    const fallback = image.original || '/assets/default.png'
    const { large: imageUrl = fallback } = image

    return html`
      <a class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray" href="/labels/${id}">
        <img aria-label=${name} src=${imageUrl} decoding="auto" class="aspect-ratio--object">
        <span class="absolute bottom-0 truncate w-100 h2" style="top:100%;">
          ${name}
        </span>
      </a>
    `
  }

  update () {
    return false
  }
}

module.exports = LabelItem
