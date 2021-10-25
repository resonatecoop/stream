const html = require('choo/html')
const viewLayout = require('../../layouts/search')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
const card = require('../../components/profiles/card')
const { isNode } = require('browser-or-node')

module.exports = () => viewLayout(renderSearch)

function renderSearch (state, emit) {
  if (isNode) emit('prefetch:search')

  const kinds = [...new Set(state.search.results.map(({ kind }) => kind))]
  const profile = baseHref => {
    return ({ name, user_id: id, images = {} }, index) => {
      const fallback = images['profile_photo-l'] || images['profile_photo-m'] || images.profile_photo || imagePlaceholder(400, 400)
      const src = index === 1 ? images['profile_photo-xxl'] || images['profile_photo-xl'] : fallback
      return card(baseHref + '/' + id, src, name)
    }
  }

  const result = {
    artist: profile('/artist'),
    label: profile('/label'),
    band: profile('/artist'),
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
    track: ({ title, cover, display_artist: artist, track_id: id }) => {
      const src = cover || imagePlaceholder(400, 400)

      return html`
        <li class="fl w-50 w-third-m w-20-l ph3 pt3 pb4 grow first-child--large">
          <a class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray" href="/track/${id}">
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
    }
  }

  const results = kinds.includes(state.query.kind)
    ? state.search.results.filter(({ kind }) => kind === state.query.kind)
    : state.search.results

  // requires min score equal to 50%
  const maxScore = Math.max.apply(Math, results.map(({ score }) => score))

  return html`
    <div class="flex flex-auto flex-column min-vh-100 ph3">
      <h2 class="lh-title f3 fw1">${state.query.q}</h2>

      ${state.search.notFound ? html`<span class="f4 lh-copy">There are no results to display.</span>` : ''}

      <div class="ml-3 mr-3">
        <ul class="list ma0 pa0 cf mt5 mt0-l">
          ${results.map(item => {
              item.score = item.score / maxScore * 100
              return item
            }).filter(({ score }) => {
              return score >= 50
            }).map(item => result[item.kind](item))}
        </ul>
      </div>
    </div>
  `
}
