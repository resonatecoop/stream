const html = require('choo/html')
const Releases = require('../../components/trackgroups')
const Pagination = require('../../components/pagination')
const viewLayout = require('../../layouts/discovery')

const tags = [
  'electronic',
  'electro',
  'ambient',
  'pop',
  'hiphop',
  'experimental',
  'folk',
  'instrumental',
  'punk',
  'funk',
  'house',
  'indie',
  'jazz'
]

module.exports = DiscoverView

function DiscoverView () {
  return (state, emit) => {
    return viewLayout((state, emit) => html`
      <section id="discovery" class="flex flex-column flex-auto w-100 ph4">
        <h2 class="lh-title f3 fw1">
          Discover new sounds and genres.<br>
          New releases added daily.
        </h2>
        <ul class="list ma0 pa0 pv2 flex flex-wrap mw7">
          ${tags.map(tag => {
            const href = `/tag/${tag}`

            return html`
              <li>
                <a class="link db ph3 pv1 near-black mr2 mv1 f5 br-pill bg-light-gray" href=${href}>#${tag}</a>
              </li>
            `
          })}
        </ul>

        <ul class="list ma0 pa0 mt2 flex">
          <li class="mr3">
            <a href="#featured" class="link ttu f5 lh-copy">Featured</a>
          </li>
          <li class="mr3">
            <a href="#featured" class="link dark-gray dark-gray--light gray--dark ttu f5 lh-copy">New releases</a>
          </li>
          <li>
            <a href="#popular" class="link dark-gray dark-gray--light gray--dark ttu f5 lh-copy">Popular</a>
          </li>
        </ul>

        <div class="ml-3 mr-3">
          ${state.cache(Releases, 'latest-releases').render({
            items: state.releases.items || [],
            filters: [],
            href: '/releases'
          })}
        </div>
        ${state.cache(Pagination, 'releases-pagination').render({
          page: Number(state.query.page) || 1,
          pages: state.releases.pages || 1,
          href: '/releases'
        })}
      </section>
    `)(state, emit)
  }
}
