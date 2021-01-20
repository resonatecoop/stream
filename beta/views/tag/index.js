const html = require('choo/html')
const viewLayout = require('../../layouts/search')
const icon = require('@resonate/icon-element')
const imagePlaceholder = require('../../lib/image-placeholder')
const card = require('../../components/profiles/card')
const Pagination = require('../../components/pagination')

module.exports = TagView

function TagView () {
  return viewLayout((state, emit) => {
    const result = {
      album: ({ name, display_artist: artist, images = {}, creator_id: id, title, slug }) => {
        const src = images.medium.url || imagePlaceholder(400, 400)
        return card(`/artist/${id}/release/${slug}`, src, html`
          <span class="lh-copy truncate fw4">${title}</span>
          <span class="f5 dark-gray lh-copy">By ${artist}</span>
        `)
      },
      track: ({ title, cover, track_id: id }) => {
        return card(`/track/${id}`, cover, title)
      }
    }

    state.tag.items = ['album', 'track'].includes(state.params.kind)
      ? state.tag.items.filter(({ kind }) => kind === state.params.kind)
      : state.tag.items

    return html`
      <div class="flex flex-auto flex-column min-vh-100">
        <div class="mh3">
          <h2 class="lh-title f4 fw1">Found a total of <span class="b">${state.tag.count}</span> releases matching the term <span class="b">#${state.params.tag}</span>.</h2>
          ${state.tag.notFound ? renderPlaceholder(state) : renderResults(state)}
        </div>
        ${!state.tag.notFound ? state.cache(Pagination, 'tag-pagination').render({
          page: Number(state.query.page) || 1,
          pages: state.tag.numberOfPages || 1
        }) : ''}
      </div>
    `

    function renderResults (state) {
      return html`
        <ul class="list ma0 pa0 ml-3 mr-3">
          ${state.tag.items.map((item) => result[item.kind](item))}
        </ul>
      `
    }

    function renderPlaceholder (state) {
      return html`
        <div class="flex justify-center items-center mt3">
          ${icon('info', { size: 'xs' })}
          <p class="lh-copy pl3">No results found for:<span class="b pl1">${state.params.tag}</span>.</p>
        </div>
      `
    }
  })
}
