const html = require('choo/html')
const viewLayout = require('../../layouts/search')
const icon = require('@resonate/icon-element')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
const { isNode } = require('browser-or-node')
const card = require('../../components/profiles/card')
const Pagination = require('../../components/pagination')

module.exports = TagView

function TagView () {
  return viewLayout((state, emit) => {
    if (isNode) emit('prefetch:tag')

    const result = {
      album: ({ name, display_artist: artist, images = {}, creator_id: id, title, slug }) => {
        const src = images.medium.url || imagePlaceholder(400, 400)

        return html`
          <li class="fl w-50 w-third-m w-20-l ph3 pt3 pb4 grow first-child--large">
            <a class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray" href="/artist/${id}/release/${slug}">
              <figure class="ma0">
                <img src=${src} decoding="auto" class="aspect-ratio--object z-1">
                <figcaption class="absolute bottom-0 w-100 h3 flex flex-column" style="top:100%;">
                  <span class="truncate f5 lh-copy">${title}</span>
                  <span class="truncate f5 lh-copy dark-gray dark-gray--light gray--dark">${artist}</span>
                </figcaption>
              </figure>
            </a>
          </li>
        `
      },
      track: ({ title, cover, track_id: id }) => {
        return card(`/track/${id}`, cover, title)
      }
    }

    state.tag.items = ['album', 'track'].includes(state.query.kind)
      ? state.tag.items.filter(({ kind }) => kind === state.query.kind)
      : state.tag.items

    return html`
      <div class="flex flex-auto flex-column min-vh-100">
        <div class="mh3">
          <h2 class="lh-title f3 fw1">#${state.query.term}</h2>
          ${state.tag.notFound ? renderPlaceholder(state) : renderResults(state)}
        </div>
        ${!state.tag.notFound
          ? state.cache(Pagination, 'tag-pagination').render({
            page: Number(state.query.page) || 1,
            pages: state.tag.numberOfPages || 1
          })
          : ''}
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
          <p class="lh-copy pl3">No results found for:<span class="b pl1">${state.query.term}</span>.</p>
        </div>
      `
    }
  })
}
