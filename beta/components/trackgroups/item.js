const Component = require('choo/component')
const html = require('choo/html')
const imagePlaceholder = require('../../lib/image-placeholder')

class Item extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit
    this.local = {}
  }

  createElement (props) {
    const state = this.state

    this.local.item = props.data
    this.local.layout = props.layout
    this.local.href = props.href || state.href

    const {
      display_artist: displayArtist,
      title,
      slug,
      creator_id: creatorId,
      cover,
      type
    } = this.local.item

    const id = creatorId // TODO add optional display name slug

    const pathname = {
      playlist: `/u/${id}/playlist/${slug}`
    }[type] || `/artist/${id}/release/${slug}`

    const url = new URL(pathname, 'http://localhost')

    const src = cover || imagePlaceholder(400, 400)

    // TODO set proper dimensions on img tag

    return html`
      <article class="fl w-100 w-50-ns w-33-m w-20-l pa3">
        <div class="grow">
          <a href=${url.pathname} class="db link aspect-ratio aspect-ratio--1x1 bg-dark-gray bg-dark-gray--dark">
            <figure class="ma0">
              <picture>
                ${cover ? html`
                  <source srcset=${src.replace('.jpg', '.webp')} type="image/webp">
                  <source srcset=${src.replace('.webp', '.jpg')} type="image/jpeg">
                ` : ''}
                <img src=${src} width=400 height=400 class="aspect-ratio--object z-1" />
              </picture>
              <figcaption class="clip">${title}</figcaption>
            </figure>
          </a>
        </div>
        <a href=${url.pathname} class="link flex flex-auto">
          <div class="flex flex-column w-100 flex-auto pt3">
            <h4 class="dark-gray dark-gray--light gray--dark f5 lh-copy fw1 ma0 pa0">${title}</h4>
            ${displayArtist ? html`<h5 class="f5 dark-gray dark-gray--light gray--dark fw1 ma0 pa0 lh-copy">${displayArtist}</h5>` : ''}
          </div>
        </a>
      </article>
    `
  }

  update () {
    return true
  }
}

module.exports = Item
