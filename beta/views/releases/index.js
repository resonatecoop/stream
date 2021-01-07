const html = require('choo/html')
const Releases = require('../../components/trackgroups')
const Pagination = require('../../components/pagination')
const viewLayout = require('../../layouts/default')

module.exports = ReleasesView

function ReleasesView () {
  return viewLayout((state, emit) => {
    const filters = [
      {
        name: 'limit',
        label: 'Limit',
        values: [
          { value: '15', label: '15' },
          { value: '30', label: '30' },
          { value: '60', label: '60' },
          { value: '90', label: '90' }
        ],
        value: state.query.limit
      },
      {
        name: 'type',
        label: 'Type',
        hidden: /playlists/.test(state.route),
        values: [
          { value: '', label: 'All' },
          { value: 'ep', label: 'EP' },
          { value: 'lp', label: 'LP' },
          { value: 'single', label: 'Single' },
          { value: 'podcast', label: 'Podcast', disabled: true },
          { value: 'playlist', label: 'Playlist', disabled: true }
        ],
        value: state.query.type
      }
    ]

    return html`
      <div class="flex flex-column flex-auto w-100">
        <div class="mh3">
          <h2 class="lh-title f4 fw1">Browse a total of <span class="b">${state.releases.count}</span> releases.</h2>
          <div class="flex flex-auto justify-end items-center mr3">
            ${filters
              .filter(item => !item.hidden)
              .map(({ values, value: selected, name, label }) => {
                return renderSelect(values, selected, name, label)
              })
            }
          </div>
          <div class="ml-3 mr-3">
            ${state.cache(Releases, 'latest-releases').render({
              items: state.releases.items || []
            })}
          </div>
        </div>
        ${state.cache(Pagination, 'releases-pagination-2').render({
          page: Number(state.query.page) || 1,
          pages: state.releases.pages || 1
        })}
      </div>
    `

    function renderSelect (options, selected = '', name, label) {
      const onchange = e => {
        const value = e.target.value
        const url = new URL(state.href, 'https://' + process.env.APP_DOMAIN)
        url.search = new URLSearchParams(Object.assign({}, state.query, { [name]: value }))
        emit(state.events.PUSHSTATE, url.href)
      }
      return html`
        <div class="flex ml2">
          <label for="type" class="f6 b db mr2">${label}</label>
          <select id=${name} class="ba bw b--gray bg-white black" onchange=${onchange} name=${name}>
            ${options.map(({ value, label, disabled = false }) => {
              return html`
                <option value=${value} disabled=${disabled} selected=${selected === value}>
                  ${label}
                </option>
              `
            })}
          </select>
        </div>
      `
    }
  })
}
