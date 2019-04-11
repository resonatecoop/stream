const Component = require('choo/component')
const html = require('choo/html')
const css = require('sheetify')
const prefix = css`
  @custom-media --breakpoint-not-small screen and (min-width: 30em);
  @custom-media --breakpoint-medium screen and (min-width: 30em) and (max-width: 60em);
  @custom-media --breakpoint-large screen and (min-width: 60em);

  @media(--breakpoint-large) {
    :host:first-child {
      width: 40%;
      margin-bottom: -1px;
    }
  }
`

class Label extends Component {
  constructor (name, state, emit) {
    super(name)

    this.state = state
    this.emit = emit
  }

  createElement (props) {
    const { avatar: image = {}, id, name } = props
    const fallback = image['original'] || '/assets/default.png'
    const { large: imageUrl = fallback } = image

    return html`
      <li class="${prefix} fl w-50 w-third-m w-20-l pa3 grow">
        <a class="db aspect-ratio aspect-ratio--1x1" href="/labels/${id}">
          <img aria-label=${name} src=${imageUrl} decoding="auto" class="aspect-ratio--object">
          <span class="absolute bottom-0 truncate w-100 h2" style="top:100%;">
            ${name}
          </span>
        </a>
      </li>
    `
  }

  update () {
    return true
  }
}

module.exports = Label
