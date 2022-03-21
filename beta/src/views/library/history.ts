import { View } from '../main'
import Playlist from '@resonate/playlist-component'
import Pagination from '../../components/pagination'
import libraryLayout from '../../layouts/library'
import Plays from '../../components/charts/plays'
import subMonths from 'date-fns/subMonths'
import formatISO from 'date-fns/formatISO'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

const renderHistory: View = (state): HTMLElement => {
  const playlistType = 'history'
  const id = `playlist-${playlistType}`
  const { numberOfPages: pages } = state.library

  return html`
    <div class="flex flex-column flex-row-l flex-auto w-100">
      <div class="flex flex-column flex-auto w-100 min-vh-100 ph3">
        ${state.cache(Playlist, id).render({
          type: playlistType,
          playlist: state.library.items ?? [],
          numberOfPages: state.library.numberOfPages
        })}
        ${state.cache(Pagination, playlistType + '-pagination').render({
          page: Number(state.query?.page ?? 1),
          pages: pages
        })}
      </div>
      <div class="flex flex-column ph3">
        <div class="sticky top-3 z-999">
          ${state.cache(Plays, `plays-chart-${playlistType}`).render({
            description: 'Plays',
            query: {
              from: formatISO(subMonths(new Date(), 12), { representation: 'date' }),
              to: formatISO(new Date(), { representation: 'date' }),
              type: 'paid',
              period: 'daily'
            }
          })}
        </div>
      </div>
    </div>
  `
}

const history = (): View => libraryLayout(renderHistory)
export default history
