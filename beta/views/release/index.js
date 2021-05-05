const html = require('choo/html')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
const Playlist = require('@resonate/playlist-component')
const viewLayout = require('../../layouts/trackgroup')
const { isNode } = require('browser-or-node')
const MenuButtonOptions = require('@resonate/menu-button-options-component')

/**
 * Display a release or trackgroup (single, lp, ep)
 */

module.exports = () => viewLayout(renderRelease)

function renderRelease (state, emit) {
  if (isNode) emit('prefetch:release')

  const data = state.release.data || {}

  const { title, display_artist: displayArtist, creator_id: creatorId } = data

  return html`
    <div class="flex flex-auto flex-column flex-row-l pb6">
      <div class="flex flex-column w-100 w-50-l flex-auto flex-row-l">
        ${renderArtwork(state, emit)}
      </div>
      <div class="flex flex-column flex-auto w-100 w-50-l ph2 ph4-l">
        <h2 class="flex flex-column f3 fw4 lh-title ma0 mt3">
          ${title}
          <small class="f5 lh-copy">
            <a href="/artist/${creatorId}" class="link">${displayArtist}</a>
          </small>
        </h2>
        ${renderContent(state, emit)}
      </div>
    </div>
  `

  function renderArtwork (state) {
    const data = state.release.data || {}

    const {
      cover,
      slug,
      title
    } = data

    const src = cover || imagePlaceholder(400, 400)

    return html`
      <div class="fl w-100">
        <div class="sticky db aspect-ratio aspect-ratio--1x1 bg-gray" style="top:3rem">
          <figure class="ma0">
            <picture>
              ${cover ? html`
                <source srcset=${src.replace('.jpg', '.webp')} type="image/webp">
                <source srcset=${src.replace('.webp', '.jpg')} type="image/jpeg">
              ` : ''}
              <img src=${src} width=400 height=400 class="aspect-ratio--object z-1" />
            </picture>
            <figcaption class="clip">${title}</figcaption>
          </figure>
          <div class="flex items-center absolute z-1 right-0 mr1-l" style="top:100%">
            ${state.cache(MenuButtonOptions, `menu-button-options-release-${slug}`).render({
              items: [], // no custom items yet
              selection: ['share', 'profile'],
              data: {
                creator_id: creatorId,
                cover: cover,
                title: title,
                artist: displayArtist,
                url: new URL(state.href, 'https://beta.stream.resonate.coop')
              },
              orientation: 'topright'
            })}
          </div>
        </div>
      </div>
    `
  }
}

function renderContent (state, emit) {
  const data = state.release.data || {}

  const {
    label,
    about: story = '',
    tags = [],
    performers = [],
    composers = [],
    release_date: date
  } = data

  return html`
    <section id="release-content" class="flex flex-column flex-auto mb4">
      ${state.cache(Playlist, `release-${state.params.id}`).render({
        type: 'album',
        pagination: false,
        playlist: state.release.tracks || [],
        numberOfPages: state.numberOfPages
      })}
      <div class="flex flex-column">
        ${renderLabel(label)}
        ${renderReleaseDate(date)}
        ${renderStory(story)}
        ${renderTags(tags)}
        ${renderItems(composers, 'Composers')}
        ${renderItems(performers, 'Performers')}
      </div>
    </section>
  `
}

function renderLabel (label) {
  if (!label) return

  return html`
    <dl class="flex flex-auto w-100">
      <dt class="fw1 f5 lh-copy light-gray">Label</dt>
      <dd class="ma0 fw1 f5 lh-copy flex flex-auto justify-end">${label.name}</dd>
    </dl>
  `
}

function renderReleaseDate (date) {
  if (!date) return

  return html`
    <dl class="flex flex-auto w-100">
      <dt class="f5 lh-copy b">Year</dt>
      <dd class="ma0 fw1 f5 lh-copy pl4 flex flex-auto">${new Date(date).getFullYear()}</dd>
    </dl>
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
              return html`
                <li>
                  <a class="link db ph3 pv1 near-black mr2 mv1 f5 br-pill bg-light-gray" href="/tag?term=${item}">
                    #${item}
                  </a>
                </li>
              `
            })}
          </ul>
        </dd>
      </dl>
    </div>
  `
}

function renderItems (items, title) {
  if (!items.length) return

  return html`
    <div class="flex flex-auto">
      <dl class="flex flex-wrap items-center">
        <dt class="flex-auto w-100 f5 b mr4">${title}</dt>
        ${items.map((item) => {
          return html`
            <dd class="dib f5 lh-copy commark ma0">
              <a href="/search?q=${item}" class="link">${item}</a>
            </dd>
          `
        })}
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
