const html = require('choo/html')
const Albums = require('../../components/albums')
const breadcrumb = require('../../elements/breadcrumb')
const viewLayout = require('../../elements/view-layout')

module.exports = LabelAlbumsView

function LabelAlbumsView () {
  return (state, emit) => {
    state.title = state.title || 'Labels'

    const id = parseInt(state.params.uid, 10)
    if (isNaN(id)) return emit(state.events.PUSHSTATE, '/')

    const albums = state.cache(Albums, 'label-albums-' + id).render({
      items: state.label.albums || [],
      pagination: true
    })

    return viewLayout((state, emit) => html`
      <section id="artist-profile" class="flex flex-column flex-auto w-100">
        <section id="content" class="flex flex-column flex-auto w-100 pb6 ph3">
          ${breadcrumb({ href: `/labels/${id}`, text: 'Back to label profile' })}
          <section id="artist-albums" class="flex-auto">
            <h2 class="lh-title">Albums</h2>
            ${albums}
          </section>
        </section>
      </section>
    `)(state, emit)
  }
}
