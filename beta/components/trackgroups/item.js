const Component = require('choo/component')
const html = require('choo/html')
const imagePlaceholder = require('@resonate/svg-image-placeholder')

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
      display_artist: artist,
      title,
      slug,
      creator_id: creatorId,
      cover,
      type,
      tags = []
    } = this.local.item

    const id = creatorId // TODO add optional display name slug

    const pathname = {
      playlist: `/u/${id}/playlist/${slug}`
    }[type] || `/artist/${id}/release/${slug}`

    const url = new URL(pathname, 'http://localhost')
    const href = url.pathname

    const src = cover || imagePlaceholder(400, 400)

    // TODO set proper dimensions on img tag

    return html`
      <article class="fl w-100 w-33-ns w-25-l pa3 mb6">
        <div class="grow">
          <a href=${href} title=${title} class="db link aspect-ratio aspect-ratio--1x1 bg-dark-gray bg-dark-gray--dark">
            <figure class="ma0">
              <picture>
                ${cover
                ? html`
                  <source srcset=${src.replace('.jpg', '.webp')} type="image/webp">
                  <source srcset=${src.replace('.webp', '.jpg')} type="image/jpeg">
                `
                : ''}
                <img src=${src} width=400 height=400 class="aspect-ratio--object z-1" />
              </picture>
              <figcaption class="absolute w-100 flex flex-column" style="top:100%;">
                <span class="f4 fw1 truncate mv1 lh-title">${title}</span>
                <span class="truncate f5 mb1 lh-copy dark-gray dark-gray--light gray--dark">${artist}</span>
                <dl class="ma0">
                  <dt class="clip">Tags</dt>
                  <dd class="ma0">
                    <ul class="list ma0 pa0 flex flex-wrap">
                      ${tags.slice(0, 3).map((tag) => {
                        return html`
                          <li class="mr1 lh-copy f5">#${tag}</li>
                        `
                      })}
                    </ul>
                  </dd>
                </dl>
              </figcaption>
            </figure>
          </a>
        </div>
      </article>
    `
  }

  update () {
    return true
  }
}

module.exports = Item
