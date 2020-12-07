const html = require('choo/html')
const imagePlaceholder = require('../../lib/image-placeholder')
const Playlist = require('@resonate/playlist-component')
const viewLayout = require('../../layouts/default')

module.exports = PlaylistView

/**
* Display a playlist (trackgroup type:playlist)
*/

function PlaylistView () {
  return viewLayout((state, emit) => {
    return html`
      <div class="flex flex-column flex-auto w-100 ph4">
        ${renderPlaylist(state, emit)}
      </div>
    `
  })
}

function renderArtwork (props = {}) {
  const {
    cover,
    title
  } = props

  return html`
    <div class="fl w-100">
      <div class="sticky db aspect-ratio aspect-ratio--1x1 bg-gray" style="top:3rem">
        <figure class="ma0">
          <img src=${cover || imagePlaceholder(400, 400)} width=400 height=400 class="aspect-ratio--object z-1" />
          <figcaption class="clip">${title}</figcaption>
        </figure>
      </div>
    </div>
  `
}

function renderPlaylist (state, emit) {
  const data = state.playlist.data || {}

  const { title, creator_id: creatorId, user = {} } = data

  return html`
    <div class="flex flex-column flex-row-l">
      <div class="flex flex-column w-100 w-50-l flex-auto flex-row-l" style="top:3rem">
        ${renderArtwork(data)}
      </div>
      <div class="flex flex-column flex-auto w-100 w-50-l ph2 ph4-l">
        <h2 class="flex flex-column f3 fw4 lh-title ma0 mt3">
          ${title}
          <small class="f5 lh-copy">
            <a href="/user/${creatorId}" class="link">${user.name}</a>
          </small>
        </h2>
        ${renderContent(data)}
      </div>
    </div>
  `

  function renderContent (props = {}) {
    const {
      about: story = '',
      tags = []
    } = props

    return html`
      <section id="release-content" class="flex flex-column flex-auto mb4">
        ${state.cache(Playlist, `playlist-${state.params.id}`).render({
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
              ${items.map((item) => {
                const hashtag = item.toLowerCase().split(' ').join('').split('-').join('')
                return html`
                  <li>
                    <a class="link db ph3 pv1 near-black mr2 mv1 f5 br-pill bg-light-gray" href="/tag/${hashtag}">#${hashtag}</a>
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
