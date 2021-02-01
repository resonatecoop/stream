const { isNode } = require('browser-or-node')
const html = require('choo/html')
const Labels = require('../../components/profiles')
const Pagination = require('../../components/pagination')
const subView = require('../../layouts/browse')

module.exports = () => subView(renderLabels)

function renderLabels (state, emit) {
  if (isNode) emit('prefetch:labels')

  return html`
    <section id="labels" class="flex flex-column flex-auto w-100">
      ${state.cache(Labels, 'labels').render({
        items: state.labels.items
      })}
      ${state.cache(Pagination, 'labels-pagination').render({
        page: Number(state.query.page) || 1,
        pages: state.labels.numberOfPages || 1
      })}
    </section>
  `
}
