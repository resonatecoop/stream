const html = require('choo/html')
const subView = require('../../layouts/default')

module.exports = TagView

function TagView () {
  return subView((state, emit) => {
    const result = {
      album: (props) => {
        const { title, images = {}, creator_id: creatorId, slug } = props
        const src = images.medium.url
        const id = creatorId // TODO add slug

        return html`
          <li class="fl w-50 w-third-m w-20-l pa3 grow first-child--large">
            <a class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray bg-dark-gray--dark" href="/artist/${id}/album/${slug}">
              <figure class="ma0">
                <img alt=${title} src=${src} decoding="auto" class="aspect-ratio--object z-1">
                <figcaption class="absolute bottom-0 truncate w-100 h2" style="top:100%;">
                  ${title}
                </figcaption>
              </figure>
            </a>
          </li>
        `
      },
      track: (props) => {
        const { title, cover, track_id: trackId } = props
        const id = trackId // TODO add slug

        return html`
          <li class="fl w-50 w-third-m w-20-l pa3 grow first-child--large">
            <a class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray bg-dark-gray--dark" href="/track/${id}">
              <figure class="ma0">
                <img alt=${title} src=${cover} decoding="auto" class="aspect-ratio--object z-1">
                <figcaption class="absolute bottom-0 truncate w-100 h2" style="top:100%;">
                  ${title}
                </figcaption>
              </figure>
            </a>
          </li>
        `
      }
    }

    return html`
      <div class="flex flex-auto flex-column min-vh-100">
        <ul class="list ma0 pa0">
          ${state.tag.items.map((item) => result[item.kind](item))}
        </ul>
      </div>
    `
  })
}
