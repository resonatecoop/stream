import Releases from '../../components/trackgroups'
import Pagination from '../../components/pagination'
import navigateToAnchor from '../../lib/navigate-to-anchor'
import { isNode } from 'browser-or-node'
import discoverLayout from '../../layouts/discover'
import tags from '../../lib/tags'
import { View } from '../main'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const html = require('choo/html')

const renderDiscover: View = (state, emit): HTMLElement => {
  if (isNode) emit('prefetch:discover')

  return html`
    <section id="discover" class="flex flex-column flex-auto w-100 ph3 ph4-ns">
      <h2 class="lh-title f3 fw1">
        The co-operative music streaming platform.<br>
        Owned and run by members.
      </h2>

      <ul class="list ma0 pa0 pv2 flex flex-wrap mw7">
        ${tags.map(tag => {
          const href = `/tag?term=${tag}`

          return html`
            <li>
              <a class="link db ph3 pv1 near-black mr2 mv1 f5 br-pill bg-light-gray" href=${href}>#${tag}</a>
            </li>
          `
        })}
      </ul>

      <ul class="list ma0 pa0 mt3 flex flex-wrap">
        <li class="mr3">
          <a href="#releases" onclick=${navigateToAnchor} class="link ttu lh-copy">New releases</a>
        </li>
        <li class="mr3">
          <a href="/releases?order=random" title="Random releases" class="link dark-gray dark-gray--light gray--dark ttu lh-copy">Random</a>
        </li>
        <li class="mr3">
          <a href="/tracks?order=plays" title="Currently playing" class="link dark-gray dark-gray--light gray--dark ttu lh-copy">Currently playing</a>
        </li>
      </ul>

      <section class="relative">
        <a id="releases" class="absolute" style="top:-80px"></a>
        <div class="ml-3 mr-3">
          ${state.cache(Releases, 'latest-releases-discover').render({
            items: state.releases?.items ?? [],
            filters: []
          })}
        </div>
        ${state.cache(Pagination, 'releases-pagination-discover').render({
          page: 1,
          href: '/releases',
          pages: state.releases?.pages ?? 1
        })}
      </section>
    </section>
  `
}

const discover = (): View => discoverLayout(renderDiscover)
export default discover
