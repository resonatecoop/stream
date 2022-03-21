import { isNode } from 'browser-or-node'
import Profiles from '../../components/profiles'
import Pagination from '../../components/pagination'
import browseLayout from '../../layouts/browse'
import { View } from '../main'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

const renderLabels: View = (state, emit): HTMLElement => {
  if (isNode) emit('prefetch:labels')

  return html`
    <section id="labels" class="flex flex-column flex-auto w-100">
      ${state.cache(Profiles, 'labels').render({
        items: state.labels?.items
      })}
      ${state.cache(Pagination, 'labels-pagination').render({
        page: Number(state.query?.page ?? 1),
        pages: state.labels?.numberOfPages ?? 1
      })}
    </section>
  `
}

const labels = (): View => browseLayout(renderLabels)
export default labels
