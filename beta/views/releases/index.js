const html = require('choo/html')
const Releases = require('../../components/trackgroups')
const Pagination = require('../../components/pagination')

module.exports = ReleasesView

function ReleasesView () {
  return (state, emit) => {
    return html`
      <div class="flex flex-column flex-auto w-100">
        ${state.cache(Releases, 'latest-releases').render({
          items: state.releases.items || [],
          filters: []
        })}
        ${state.cache(Pagination, 'releases-pagination-2').render({
          page: Number(state.query.page) || 1,
          pages: state.releases.pages || 1
        })}
      </div>
    `
  }
}
