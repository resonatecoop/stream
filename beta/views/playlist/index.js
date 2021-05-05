const html = require('choo/html')
const Grid = require('../../components/grid')
const Playlist = require('@resonate/playlist-component')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
const viewLayout = require('../../layouts/trackgroup')
const { isNode } = require('browser-or-node')

/**
* Display a playlist (trackgroup type:playlist)
*/

module.exports = () => viewLayout(renderPlaylist)

function renderPlaylist (state, emit) {
  if (isNode) emit('prefetch:playlist')

  const data = state.playlist.data || {}

  const { title, creator_id: creatorId, user = {} } = data

  return html`
    <div class="flex flex-column flex-auto flex-row-l pb6">
      <div class="flex flex-column w-100 w-50-l flex-auto flex-row-l">
        ${renderArtwork(data)}
      </div>
      <div class="flex flex-column flex-auto w-100 w-50-l ph2 ph4-l">
        <div class="flex mt3">
          <h2 class="flex flex-column f3 fw4 lh-title ma0 mt0">
            ${title}
            <small class="flex">
              <a href="/u/${creatorId}" class="link lh-copy f5">${user.name}</a>
            </small>
          </h2>
          <div class="flex flex-auto items-center">
            ${creatorId && state.user.uid === creatorId ? html`
              <div class="flex flex-auto justify-end">
                <a class="db ph3 pv2 link" href="${state.href}/edit">Edit</a>
              </div>
              ` : ''}
          </div>
        </div>
        ${renderContent(data)}
      </div>
    </div>
  `

  function renderArtwork (props = {}) {
    const {
      cover,
      items = []
    } = props

    const covers = items
      .map(({ track }) => track.cover)

    const coverSrc = cover || imagePlaceholder(600, 600)

    return html`
      <div class="flex flex-column flex-auto w-100">
        <div class="sticky bg-dark-gray" style="top:3rem">
          <a href="/u/${state.params.id}/playlist/${state.params.slug}" class="link">
            ${items.length >= 13 ? state.cache(Grid, 'cover-grid').render({ items: covers }) : html`
              <article class="cf">
                <div class="fl w-100">
                  <div class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray bg-dark-gray--dark dim">
                    <span role="img" class="aspect-ratio--object bg-center cover" style="background-image:url(${coverSrc});"></span>
                  </div>
                </div>
              </article>
            `}
          </a>
        </div>
      </div>
    `
  }

  function renderContent (props = {}) {
    const {
      about: story = '',
      tags = []
    } = props

    return html`
      <section id="release-content" class="flex flex-column flex-auto pt2 mb4">
        ${state.cache(Playlist, `playlist-${state.params.id}-${state.params.slug}`).render({
          playlist: state.playlist.tracks || []
        })}
        <div class="flex flex-column">
          ${renderStory(story)}
          ${renderTags(tags)}
        </div>
      </section>
    `
  }

  function renderTags (items) {
    if (!items.length) return

    return html`
      <div class="flex flex-auto">
        <dl class="flex flex-column">
          <dt class="f5 b">Tags</dt>
          <dd class="ma0">
            <ul class="ma0 pa0 list flex flex-wrap">
              ${items.map(item => {
                return html`
                  <li>
                    <a class="link db ph3 pv1 near-black mr2 mv1 f5 br-pill bg-light-gray" href="/tag?term=${item}">#${item}</a>
                  </li>
                `
              })}
            </ul>
          </dd>
        </dl>
      </div>
    `
  }

  function renderStory (story) {
    if (!story) return

    return html`
      <div class="flex flex-column flex-auto">
        <p class="lh-copy f5">${story}</p>
      </div>
    `
  }
}
