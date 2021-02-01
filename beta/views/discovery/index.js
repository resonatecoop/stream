const html = require('choo/html')
const Releases = require('../../components/trackgroups')
const navigateToAnchor = require('../../lib/navigate-to-anchor')
const { isNode } = require('browser-or-node')
const viewLayout = require('../../layouts/discovery')

const tags = [
  'ambient',
  'electro',
  'electronic',
  'experimental',
  'folk',
  'funk',
  'hiphop',
  'house',
  'indie',
  'instrumental',
  'jazz',
  'pop',
  'punk'
]

module.exports = () => viewLayout(renderDiscovery)

function renderDiscovery (state, emit) {
  if (isNode) emit('prefetch:discovery')

  return html`
    <section id="discovery" class="flex flex-column flex-auto w-100 ph3 ph4-ns">
      <h2 class="lh-title f3 fw1">
        Discover new sounds and genres.<br>
        New releases added daily.
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

      <ul class="list ma0 pa0 mt3 flex">
        <li class="mr3">
          <a href="#featured" onclick=${navigateToAnchor} class="link ttu lh-copy">Featured</a>
        </li>
        <li class="mr3">
          <a href="/releases" class="link dark-gray dark-gray--light gray--dark ttu lh-copy">New releases</a>
        </li>
      </ul>

      <section class="relative">
        <a id="featured" class="absolute" style="top:-80px"></a>
        <div class="ml-3 mr-3">
          ${state.cache(Releases, 'featured-releases').render({
            items: state.featuredReleases.items || [],
            filters: []
          })}
        </div>
      </section>
    </section>
  `
}
