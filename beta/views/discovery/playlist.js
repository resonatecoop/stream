const html = require('choo/html')
const Playlist = require('@resonate/playlist-component')
const subView = require('../../layouts/default')

module.exports = DiscoverPlaylistView

function DiscoverPlaylistView () {
  return subView((state, emit) => {
    const playlistType = state.params.type || 'top-fav'
    const id = `playlist-${playlistType}`

    return html`
      <section class="flex flex-row flex-auto w-100">
        <div class="dn db-l sticky top-0 z-999">
          <nav role="navigation" aria-label="Library navigation" class="sticky z-999" style="top:3rem">
            <ul class="list ma0 pa0 flex flex-column justify-around">
              <li>
                <a class="link db dim pv2 ph4 mr2 w-100 nowrap" href="/discovery/top-fav">Top Favorites</a>
              </li>
              <li>
                <a class="link db dim pv2 ph4 mr2 w-100 nowrap" href="/discovery/staff-picks">Staff Picks</a>
              </li>
              <li>
                <a class="link db dim pv2 ph4 mr2 w-100" href="/discovery/random">Random</a>
              </li>
            </ul>
          </nav>
        </div>
        <div class="flex flex-column flex-auto w-100 min-vh-100 ph3">
          ${state.cache(Playlist, id).render({
            type: playlistType,
            pagination: true,
            playlist: state.tracks || [],
            numberOfPages: state.numberOfPages
          })}
        </div>
      </section>
    `
  })
}
