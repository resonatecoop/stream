import Playlist from '@resonate/playlist-component'
import libraryLayout from '../../layouts/library'
import { View } from '../main'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

const renderPicks: View = (state): HTMLElement => {
  const playlistType = 'favorites'
  const id = `playlist-${playlistType}`

  return html`
    <div class="flex flex-column flex-row-l flex-auto w-100">
      ${state.cache(Playlist, id).render({
        type: playlistType,
        pagination: true,
        playlist: state.library.items ?? [],
        numberOfPages: state.library.numberOfPages
      })}
    </div>
  `
}

const picks = (): View => libraryLayout(renderPicks)
export default picks
