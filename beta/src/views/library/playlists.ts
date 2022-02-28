import libraryLayout from '../../layouts/library'
import Trackgroups from '../../components/trackgroups'
import { View } from '../main'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

const renderPlaylists: View = (state): HTMLElement => html`
  <div class="flex flex-column flex-auto w-100">
    ${state.cache(Trackgroups, `playlists-${state.params.id}`).render({
      items: state.playlists?.items ?? []
    })}
  </div>
`

const playlists = (): View => libraryLayout(renderPlaylists)
export default playlists
