const html = require('choo/html')
const Releases = require('../../components/trackgroups')
const Pagination = require('../../components/pagination')
const navigateToAnchor = require('../../lib/navigate-to-anchor')
const { isNode } = require('browser-or-node')
const viewLayout = require('../../layouts/discover')
const tags = require('../../lib/tags')

module.exports = () => viewLayout(renderDiscover)

function renderDiscover (state, emit) {
  if (isNode) emit('prefetch:discover')

  return html`
    <section id="discover" class="flex flex-column flex-auto w-100 ph3 ph4-ns">
      <div class="mv4">
        <h2 class="di mr3 lh-title f3 fw1 v-mid">
          The co-operative music streaming platform.<br />
          Owned and run by members.
        </h2>

        ${!state.user.uid
          ? html`
              <a
                class="link pv2 ph3 ttu ba b--mid-gray b--dark-gray--dark f6 b"
                href="https://resonate.coop/join"
              >
                Join now
              </a>
            `
          : null}
      </div>

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
            items: state.releases.items || [],
            filters: []
          })}
        </div>
        ${state.cache(Pagination, 'releases-pagination-discover').render({
          page: 1,
          href: '/releases',
          pages: state.releases.pages || 1
        })}
      </section>
    </section>
  `
}
