const html = require('choo/html')
const icon = require('@resonate/icon-element')
const moment = require('moment')
const imagePlaceholder = require('../../lib/image-placeholder')
const Playlist = require('@resonate/playlist-component')
const subView = require('../../layouts/default')
const { background: bg } = require('@resonate/theme-skins')

module.exports = AlbumView

/**
* Display a single album (lp, ep)
*/

function AlbumView () {
  return subView((state, emit) => {
    const loaded = state.release.loaded
    const notFound = state.release.notFound

    if (loaded && notFound) {
      return html`
        <div class="flex flex-column w-100 w-75-m w-50-l mh3 mh0-ns mw6">
          <article>
            <h1 class="lh-title f3">404</h1>

            <p class="lh-copy f4">
              This resource can't be displayed right now.
            </p>

            <div class="flex mt4">
              <div class="flex">
                <a href="/" class="db link bg-black white pa3 pv2 dim">Back home</a><br>
              </div>

              <div class="flex ml3">
                <a href="https://resonate.is/support" target="_blank" rel="noreferer noopener" class="db link black pa3 pv2 dim">Support</a>
              </div>
            </div>
          </article>
        </div>
      `
    }

    return html`
      <div class="flex flex-column flex-auto w-100">
        <div class="sticky z-999 bg-near-black top-0 top-3-l">
          <button class="${bg} br1 bn w2 h2 ma2" onclick=${() => window.history.go(-1)}>
            <div class="flex items-center justify-center">
              ${icon('arrow', { size: 'sm' })}
            </div>
          </button>
        </div>
        ${renderTrackgroup(state, emit)}
      </div>
    `
  })
}

function renderArtwork (props = {}) {
  const {
    cover,
    title
  } = props

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
      </div>
    </div>
  `
}

function renderTrackgroup (state, emit) {
  const data = state.release.data || {}

  const { title, display_artist: displayArtist, creator_id: creatorId } = data

  return html`
    <div class="flex flex-column flex-row-l">
      <div class="flex flex-column w-100 w-50-l flex-auto flex-row-l" style="top:3rem">
        ${renderArtwork(data)}
      </div>
      <div class="flex flex-column flex-auto w-100 w-50-l ph4 ph5-l">
        <h2 class="flex flex-column f3 fw4 lh-title ma0 mt3">
          ${title}
          <small class="f5 lh-copy">
            <a href="/artist/${creatorId}" class="link">${displayArtist}</a>
          </small>
        </h2>
        ${renderContent(data)}
      </div>
    </div>
  `

  function renderContent (props = {}) {
    const {
      label,
      about: story = '',
      tags = [],
      performers = [],
      composers = [],
      release_date: date
    } = props

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
        <dd class="ma0 fw1 f5 lh-copy pl4 flex flex-auto">${moment(date).format('YYYY')}</dd>
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
                const hashtag = item.toLowerCase().split(' ').join('').split('-').join('')
                return html`
                  <li>
                    <a class="link db ph3 pv1 near-black mr2 mv1 f5 br-pill bg-light-gray" href="/tag/${hashtag}">
                      #${hashtag}
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
        <dl class="flex items-center">
          <dt class="f5 b mr4">${title}</dt>
          ${items.map((item) => {
            return html`
              <dd class="dib f5 lh-copy commark ma0">
                <a href="/search/${item}" class="link">${item}</a>
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
}
