const html = require('choo/html')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
const TrackComponent = require('@resonate/track-component')

module.exports = view

function view (state, emit) {
  const { track = {}, url, track_group: trackGroup } = state.track.data
  const cover = track.cover || imagePlaceholder(600, 600)

  return html`
    <section id="single-track" class="flex flex-column flex-auto">
      <article class="mb6 flex flex-column flex-row-l flex-auto">
        <div class="flex flex-column w-100 w-50-l flex-auto flex-row-l">
          <div class="fl w-100">
            <div class="flex flex-auto flex-column mw6-l sticky" style="top:3rem">
              <div class="db aspect-ratio aspect-ratio--1x1 bg-gray">
                <figure class="ma0">
                  <img src=${cover} width=400 height=400 class="aspect-ratio--object z-1" />
                  <figcaption class="clip">${track.title}</figcaption>
                </figure>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-column w-100 flex-auto pa3">
          ${state.cache(TrackComponent, `track-${track.id}`).render({
            count: 0,
            showArtist: true,
            fav: 0,
            index: 0, // only one track
            hideCount: true,
            hideMenu: true,
            src: url,
            track: track,
            trackGroup,
            playlist: [track]
          })}
        </div>
      </article>
    </section>
  `
}
