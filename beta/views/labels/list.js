const html = require('choo/html')
const Labels = require('../../components/labels')

const viewLayout = require('../../elements/view-layout')

module.exports = LabelsView

function LabelsView () {
  return (state, emit) => {
    state.title = state.title || 'Labels'

    const labels = state.cache(Labels, 'labels').render({
      items: state.labels
    })

    return viewLayout((state, emit) => html`
      <section id="labels" class="bg-near-white black bg-black--dark white--dark bg-near-white--light black--light flex flex-column flex-auto w-100 pb6 ph3">
        ${labels}
      </section>
    `
    )(state, emit)
  }
}
