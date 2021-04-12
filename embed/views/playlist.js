const html = require('choo/html')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
const Grid = require('../../beta/components/grid')
const Playlist = require('@resonate/playlist-component')

module.exports = view

function view (state, emit) {
  const data = state.playlist.data || {}

  const { title, user = {}, creator_id: creatorId } = data

  return html`
    <div class="flex flex-auto flex-column flex-row-l pb6">
      <div class="flex flex-column w-100 w-50-l flex-auto flex-row-l">
        ${renderArtwork(data)}
      </div>
      <div class="flex flex-column flex-auto w-100 w-50-l ph2 ph4-l">
        <h2 class="flex flex-column f3 fw4 lh-title ma0 mt3">
          ${title}
          <small class="f5 lh-copy">
            <a href="${process.env.APP_HOSTNAME}/u/${creatorId}" target="_blank" class="link">${user.nicename}</a>
          </small>
        </h2>
        ${renderContent(state, emit)}
      </div>
    </div>
  `

  function renderArtwork (props = {}) {
    const {
      cover,
      items = []
    } = props

    const covers = items
      .map(({ track }) => track.cover)

    const coverSrc = cover || imagePlaceholder(600, 600)

    return html`
      <div class="flex flex-column flex-auto w-100">
        <div class="sticky bg-dark-gray" style="top:3rem">
          <a href="${process.env.APP_HOSTNAME}/u/${state.params.id}/playlist/${state.params.slug}" target="_blank" class="link">
            ${items.length >= 13 ? state.cache(Grid, 'cover-grid').render({ items: covers }) : html`
              <article class="cf">
                <div class="fl w-100">
                  <div class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray bg-dark-gray--dark dim">
                    <span role="img" class="aspect-ratio--object bg-center cover" style="background-image:url(${coverSrc});"></span>
                  </div>
                </div>
              </article>
            `}
          </a>
        </div>
      </div>
    `
  }
}

function renderContent (state, emit) {
  return html`
    <section id="release-content" class="flex flex-column flex-auto pt2 mb4">
      ${state.cache(Playlist, `playlist-${state.params.id}`).render({
        type: 'playlist',
        hideMenu: true,
        hideCount: true,
        playlist: state.playlist.tracks || []
      })}
    </section>
  `
}
