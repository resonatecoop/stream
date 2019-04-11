const TITLE = 'Resonate - Embed app'
const html = require('choo/html')
const TrackComponent = require('@resonate/track-component')
const { background: bg, text } = require('@resonate/theme-skins')

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const { count, fav, track = {}, url, track_group: trackGroup } = state.track
  const trackComponent = track.id ? state.cache(TrackComponent, `track-${track.id}`).render({
    style: 'blank',
    count,
    fav,
    index: 0,
    src: url,
    track: track,
    trackGroup,
    playlist: []
  }) : ''

  return html`
    <section id="single-track" class="flex flex-column flex-auto">
      <article class="mb6 flex flex-column flex-row-l flex-auto">
        <div class="sticky flex flex-auto flex-column mw6-l" style="top:var(--height-3);z-index:-1;">
          <div class="db aspect-ratio aspect-ratio--1x1">
            <span role="img" style="background:url(${track.cover}) no-repeat;" class="bg-center cover aspect-ratio--object z-1">
            </span>
          </div>
        </div>
        <div class="${bg} ${text} flex flex-column flex-auto pa3">
          ${trackComponent}
        </div>
      </article>
    </section>
  `
}
