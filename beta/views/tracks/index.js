const html = require('choo/html')
const Playlist = require('@resonate/playlist-component')
const button = require('@resonate/button')
const Pagination = require('../../components/pagination')
const viewLayout = require('../../layouts/browse')

module.exports = () => viewLayout(renderTracks)

function renderTracks (state, emit) {
  const filters = [
    {
      name: 'order',
      label: 'Order',
      values: [
        { value: '', label: 'Change order', disabled: true },
        { value: 'random', label: 'Random' },
        { value: 'newest', label: 'Recently added' },
        { value: 'oldest', label: 'Added first' }
      ],
      value: state.query.order
    }
  ]

  const refreshButton = () => {
    return html`
      <div class="flex justify-center">
        ${button({
          onClick: () => {
            const url = new URL(state.href, 'http://localhost')
            url.search = new URLSearchParams(state.query)
            emit(state.events.REPLACESTATE, url.pathname + url.search)
          },
          title: 'Refresh page',
          text: 'Refresh',
          style: 'blank',
          outline: true
        })}
      </div>`
  }

  return html`
    <div class="flex flex-column flex-auto w-100">
      <div class="mh3">
        <h2 class="lh-title f4 fw1">
          ${state.query.order === 'random' ? 'Play from 50 random tracks' : html`Browse a total of <span class="b">${state.latestTracks.count}</span> tracks.`}
        </h2>
        <div class="flex flex-wrap flex-auto justify-end items-center mr3 mt3">
          ${filters
            .filter(item => !item.hidden)
            .map(({ values, value: selected, name, label }) => {
              return renderSelect(values, selected, name, label)
            })
          }
        </div>
      </div>
      <div class="flex flex-column flex-auto w-100 min-vh-100 ph3">
        ${state.cache(Playlist, 'latest-tracks').render({
          playlist: state.latestTracks.items || []
        })}
        ${state.query.order !== 'random' ? state.cache(Pagination, 'tracks-pagination').render({
          page: Number(state.query.page) || 1,
          pages: state.latestTracks.pages || 1
        }) : refreshButton()}
      </div>
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
      <div class="flex ml2 mb3">
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
}
