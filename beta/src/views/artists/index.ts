import Artists from '../../components/profiles'
import Pagination from '../../components/pagination'
import viewLayout from '../../layouts/browse'
import { isNode } from 'browser-or-node'
import { View } from '../main'
import { AppState } from '../../types'
import Nanobus from 'nanobus'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

function renderArtists (state: AppState, emit: Nanobus['emit']): HTMLElement {
  const renderPagination = (): HTMLElement | undefined => {
    if (!state.artists || state.artists.numberOfPages <= 1) return

    return state.cache(Pagination, 'artists-pagination').render({
      page: Number(state.query?.page ?? 1),
      pages: state.artists.numberOfPages || 1
    })
  }

  if (isNode) emit('prefetch:artists')

  return html`
    <section id="artists" class="flex flex-column flex-auto w-100 min-vh-100">
      ${state.cache(Artists, 'artists').render({
        items: state.artists?.items
      })}
      ${renderPagination()}
    </section>
  `
}

const artists = (): View => viewLayout(renderArtists)
export default artists
