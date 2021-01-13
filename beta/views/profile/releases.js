const html = require('choo/html')
const icon = require('@resonate/icon-element')
const viewLayout = require('../../layouts/profile')
const Pagination = require('../../components/pagination')
const Albums = require('../../components/albums')
const renderTotal = require('../../elements/total')
const renderBio = require('./biography')

module.exports = ProfileAlbumsView

/**
 * Profile albums v1
 */

function ProfileAlbumsView () {
  return viewLayout((state, emit) => {
    const id = Number(state.params.id)
    if (isNaN(id)) return emit(state.events.PUSHSTATE, '/')

    const kind = state.route.split('/')[0]
    const { data, notFound, albums = {} } = state[kind]
    const { items = [], numberOfPages: pages = 1, count = 0 } = albums

    let placeholder
    let bio

    if (notFound) {
      placeholder = renderPlaceholder('Resource not found')
    } else {
      bio = renderBio(state)
    }

    return html`
      <section id="content" class="flex flex-column flex-auto w-100 pb7">
        ${placeholder}
        <div class="flex flex-column" style=${!notFound ? 'min-height:100vh' : ''}>
          <section id="profile-albums" class="flex-auto flex-column mh3 mt4">
            <div class="flex">
              <h3 class="relative f4 mt0 fw3">
                Discography
                <a id="discography" class="absolute" style="top:-120px"></a>
                ${renderTotal(count)}
              </h3>
            </div>
            ${state.cache(Albums, `${kind}-albums-` + id).render({
              items,
              name: data.name
            })}
            ${state.cache(Pagination, kind + '-albums-pagination-2-' + id).render({
              page: Number(state.query.page) || 1,
              pages: pages || 1,
              href: state.href
            })}
          </section>
        </div>
        ${bio}
      </section>
    `
  })
}

function renderPlaceholder (message) {
  return html`
    <div class="flex justify-center items-center mt3">
      ${icon('info', { size: 'xs' })}
      <p class="lh-copy pl3">${message}</p>
    </div>
  `
}
