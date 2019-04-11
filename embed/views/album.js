const TITLE = 'Resonate - Embed app'
const html = require('choo/html')
const Playlist = require('@resonate/playlist-component')
const adapter = require('@resonate/schemas/adapters/v1/track')
const clock = require('mm-ss')
const { background: bg, text } = require('@resonate/theme-skins')

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const albums = state.albums.map((album, index) => {
    const playlist = state.cache(Playlist, `album-playlist-${index}`).render({
      showArtwork: false,
      type: 'album',
      style: 'small',
      playlist: album.tracks.length ? album.tracks.map(adapter) : []
    })

    const src = album.tracks.length ? album.tracks[0].artwork.large : ''

    return html`
      <article class="mb6 flex flex-column flex-row-l flex-auto">
        <div class="sticky flex flex-auto flex-column mw6-l" style="top:var(--height-3);z-index:-1;">
          <div class="db aspect-ratio aspect-ratio--1x1">
            <span role="img" style="background:url(${src}) no-repeat;" class="bg-center cover aspect-ratio--object">
            </span>
          </div>
        </div>
        <div class="${bg} ${text} flex flex-column flex-auto pa3">
          <header>
            <div class="flex flex-column pl2">
              <h3 class="ma0 lh-title f4 normal near-black">
                <a href="/albums/dezdez" class="link color-inherit">${album.name}</a>
              </h3>
              <a href="/artists/dzedez" class="link dark-gray">${album.artist}</a>
            </div>
          </header>
          ${playlist}
          <div class="flex flex-column ph2 mb2">
            <dl class="flex">
              <dt class="flex-auto w-100 ma0">Runing time</dt>
              <dd class="flex-auto w-100 ma0 dark-gray">
                ${clock(album.duration)}
              </dd>
            </dl>
          </div>
        </div>
      </article>
    `
  })

  return html`
    <section id="albums-playlists">
      ${albums}
    </section>
  `
}
