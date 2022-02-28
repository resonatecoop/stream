import Playlist from '@resonate/playlist-component'
import Pagination from '../../components/pagination'
import libraryLayout from '../../layouts/library'
import { View } from '../main'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

const renderCollection: View = (state): HTMLElement => {
  const playlistType = 'collection'
  const id = `playlist-${playlistType}`
  const { numberOfPages: pages } = state.library

  return html`
    <div class="flex flex-column flex-row-l flex-auto w-100">
      ${state.cache(Playlist, id).render({
        type: playlistType,
        playlist: state.library.items ?? []
      })}
      ${state.cache(Pagination, playlistType + '-pagination').render({
        page: Number(state.query?.page ?? 1),
        pages: pages
      })}
    </div>
  `
}

const collection = (): View => libraryLayout(renderCollection)
export default collection
