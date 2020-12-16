const html = require('choo/html')
const icon = require('@resonate/icon-element')
const viewLayout = require('../../layouts/profile')
const renderTotal = require('../../elements/total')
const Pagination = require('../../components/pagination')
const Albums = require('../../components/albums')
const Profiles = require('../../components/profiles')
const renderBio = require('./biography')
const Playlist = require('@resonate/playlist-component')

module.exports = ProfileView

/**
 * Profile view for creators (artist, band or label)
 */

function ProfileView () {
  return viewLayout((state, emit) => {
    const kind = state.route.split('/')[0]
    const data = state[kind]
    const notFound = data.notFound

    let placeholder
    let artists
    let albums
    let bio
    let memberOf
    let topTracks

    if (notFound) {
      placeholder = renderPlaceholder('Resource not found')
    } else {
      artists = renderArtists(state)
      albums = renderAlbums(state)
      bio = renderBio(state)
      topTracks = renderTopTracks(state)

      if (data.label) {
        memberOf = renderMemberOf(state)
      }
    }

    return html`
      <section id="content" class="flex flex-column flex-auto w-100 pb7">
        ${placeholder}
        <div class="flex flex-column" style=${!notFound ? 'min-height:100vh' : ''}>
          ${topTracks}
          ${artists}
          ${albums}
        </div>
        ${bio}
        ${memberOf}
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

/**
 * Render list of artists associated with label
 */

function renderArtists (state) {
  const kind = state.route.split('/')[0]

  if (kind !== 'label') return

  const id = Number(state.params.id)

  const { artists = {} } = state[kind]
  const { items = [], count = 0 } = artists

  return html`
    <section id="profile-artists" class="flex-auto">
      <div class="flex">
        <h3 class="lh-title fw3 relative ml3">
          Artists
          ${renderTotal(count)}
        </h3>
      </div>
      ${state.cache(Profiles, kind + '-artists-' + id).render({ items })}
      ${renderArtistsPagination()}
    </section>
  `

  function renderArtistsPagination () {
    const { numberOfPages: pages = 1 } = artists

    if (pages <= 1) return

    return state.cache(Pagination, kind + '-artists-pagination-' + id).render({
      page: Number(state.query.page) || 1,
      pages: pages,
      href: state.href + '/artists'
    })
  }
}

function renderTopTracks (state) {
  const kind = state.route.split('/')[0]

  if (kind !== 'artist') return

  const { topTracks = {} } = state[kind]

  return html`
    <section class="flex-auto mh3 mt4">
      <div class="flex">
        <h3 class="fw3 lh-title relative mb2">
          Highlights
          <a id="highlights" class="absolute" style="top:-120px"></a>
        </h3>
      </div>
      <div class="mr3-l mr5-l">
        ${state.cache(Playlist, `top-tracks-${kind}-${state.params.id}`).render({
          playlist: topTracks.items || [],
          type: 'playlist'
        })}
      </div>
    </section>
  `
}

/**
 * Render list of albums for a given label or artist (v1)
 */

function renderAlbums (state) {
  const kind = state.route.split('/')[0]
  const { data, albums = {} } = state[kind]
  const { items = [], count = 0 } = albums
  const id = Number(state.params.id)

  return html`
    <section class="flex-auto mh3 mt4">
      <div class="flex">
        <h3 class="fw3 lh-title relative mb4">
          Discography
          <a id="discography" class="absolute" style="top:-120px"></a>
          ${renderTotal(count)}
        </h3>
      </div>
      ${state.cache(Albums, kind + '-albums-' + id).render({
        items: items,
        name: data.name
      })}
      ${renderAlbumPagination()}
    </section>
  `

  function renderAlbumPagination () {
    const { numberOfPages: pages = 1 } = albums

    if (pages <= 1) return

    return state.cache(Pagination, kind + '-albums-pagination-' + id).render({
      page: Number(state.query.page) || 1,
      pages: pages,
      href: state.href + '/albums'
    })
  }
}

/**
 * Render label associated to artist (currently 1:1)
 */

function renderMemberOf (state) {
  const kind = state.route.split('/')[0]

  if (kind !== 'artist') return

  const data = state.artist.data

  if (!data.label) return

  const id = Number(state.params.id.split('-')[0])

  return html`
    <section id="members" class="flex-auto mh3">
      <h3 class="fw3 f4 lh-title">Member of</h3>

      <div class="ml-3 mr-3">
        ${state.cache(Profiles, `labels-${id}`).render({
          items: [data.label]
        })}
      </div>
    </section>
  `
}
