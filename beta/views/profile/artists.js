const html = require('choo/html')
const icon = require('@resonate/icon-element')
const Artists = require('../../components/profiles')
const Pagination = require('../../components/pagination')
const viewLayout = require('../../layouts/profile')
const renderTotal = require('../../elements/total')
const renderBio = require('./biography')

module.exports = () => viewLayout(renderArtists)

function renderArtists (state, emit) {
  const kind = state.route.split('/')[0]
  const id = state.params.id
  const { data, notFound, artists = {} } = state[kind]
  const { items = [], numberOfPages: pages, count = 0 } = artists

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
      <section id="profile-artists" class="flex-auto">
        <div class="flex">
          <h3 class="lh-title fw3 relative ml3">
            Artists
            ${renderTotal(count)}
          </h3>
        </div>
        ${state.cache(Artists, kind + '-artists-' + id).render({
          items,
          name: data.name
        })}
        ${state.cache(Pagination, kind + '-artists-pagination-2-' + id).render({
          page: Number(state.query.page) || 1,
          pages: pages || 1,
          href: state.href
        })}
      </section>
      ${bio}
    </section>
  `
}

function renderPlaceholder (message) {
  return html`
    <div class="flex justify-center items-center mt3">
      ${icon('info', { size: 'xs' })}
      <p class="lh-copy pl3">${message}</p>
    </div>
  `
}
