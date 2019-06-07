const html = require('choo/html')
const Artists = require('../../components/artists')
const breadcrump = require('../../elements/breadcrump')
const viewLayout = require('../../elements/view-layout')

module.exports = LabelArtistsView

function LabelArtistsView () {
  return (state, emit) => {
    state.title = state.title || 'Labels'

    const id = parseInt(state.params.uid, 10)
    if (isNaN(id)) return emit(state.events.PUSHSTATE, '/')

    const artists = state.cache(Artists, 'label-artists-' + id).render({
      items: state.label.artists || [],
      pagination: true
    })

    return viewLayout((state, emit) => html`
      <section id="artist-profile" class="flex flex-column flex-auto w-100">
        <section id="content" class="flex flex-column flex-auto w-100 pb6 ph3">
          ${breadcrump({ href: `/labels/${id}`, text: 'Back to label profile' })}
          <section id="label-artists" class="flex-auto">
            <h2 class="lh-title ml3">Artists</h2>
            ${artists}
          </section>
        </section>
      </section>
    `)(state, emit)
  }
}
