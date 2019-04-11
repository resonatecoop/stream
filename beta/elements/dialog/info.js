const html = require('choo/html')
const clock = require('mm-ss')
const PlayCount = require('@resonate/play-count')
const renderCounter = require('../../components/player/counter')
const css = require('sheetify')
const streamCosts = require('../stream-costs')
const downloadButton = require('../download-button')
const Artwork = require('../../components/player/Artwork')
const FavButton = require('../../components/favorite-button')

const destroyDialog = () => {
  const dialog = document.querySelector('dialog') // expect only 1 dialog
  if (dialog) {
    dialog.removeAttribute('open') // close dialog while not sending close event
    document.body.removeChild(dialog) // remove dialog from dom
  }
}

const prefix = css`
  :host {
    background-color: var(--playlist-bg);
  }
`

const artworkStyle = css`
  :host {
    height: 360px;
    min-width: 360px;
    z-index: 1;
  }
`

const contentStyle = css`
  :host {
    min-width: 360px;
  }
`

module.exports = renderInfoDialog

/*
 * Render info dialog
 * @param {Object} props Contains track object
 * @param {Function} emit Emit event on choo
 * @param {Object} state State object
 * @param {Object} player Player component
 */

function renderInfoDialog (props, state, emit, player) {
  const { track, tracks = [] } = props
  const artwork = new Artwork()

  if (!track.tid) return

  const {
    count = 0,
    fav,
    name,
    tid,
    uid: artistId,
    status
  } = track

  const playCount = new PlayCount(count)
  const counter = renderCounter(tid)
  playCount.counter = counter
  playCount.circles = counter.querySelectorAll('circle')

  const favButton = new FavButton(fav)

  favButton.machine.on('fav:toggle', () => {
    const message = {
      'on': 'favorite',
      'off': 'unfavorite'
    }[favButton.machine.state.fav]

    emit(message, { tid, tracks })
  })

  return html`
    <div class="${prefix} flex flex-column w-100 mw9-l">
      <div class="flex flex-column flex-row-l">
        <div class="flex flex-column">
          <div class="${artworkStyle} flex w-100">
            <div class="flex-auto w-100 h-100 relative overflow-hidden">
              ${artwork.render({
    thumb: track.artwork.small || '/thumbs/80x80-default.png',
    original: track.artwork.large || '/thumbs/default.png',
    fallback: track.artwork.small.replace('80x80-', ''),
    size: 'contain',
    animate: true
  })}
            </div>
          </div>
        </div>
        <div class="${contentStyle} flex flex-column w-100">
          <h2 class="pl3">${name}</h2>
          ${details(track)}
          ${actions()}
        </div>
      </div>
      ${footer()}
    </div>
  `

  function actions () {
    return html`
      <div class="flex flex-auto items-end pb6 pb0-ns">
        <div class="flex flex-column flex-row-l flex-auto w-100 items-center">
          <div class="pa3">
            ${playCount.counter}
          </div>
          <div class="pa3">
            ${favButton.render()}
          </div>
          ${renderStreamCosts()}
          ${message()}
          <div class="ma3">
            ${renderButtons(track)}
          </div>
        </div>
      </div>
    `
  }

  function message () {
    if (state.user.uid) return
    return html`
      <p class="f6">
        You must <a href="/" class="b green no-underline">login</a> to favorite or buy this track.
      </p>
    `
  }

  function details (props) {
    const {
      name,
      artist,
      duration,
      label,
      album,
      tags = []
    } = props

    const items = [
      {
        title: 'Artist',
        value: html`
          <a href="/artists/${artistId}" onclick=${(e) => destroyDialog()} class="color-inherit no-underline">
            ${artist}
          </a>`
      },
      { title: 'Album', value: album },
      { title: 'Title', value: name },
      { title: 'Label', value: label },
      { title: 'Duration', value: clock(duration) },
      { title: 'Tags', value: tags.length ? renderTags(tags) : false }
    ]
      .filter((item) => Boolean(item.value))
      .map(({ title, value }) => {
        return html`
      <dl class="flex flex-column w-third ph2 mw5">
        <dt class="b">${title}</dt>
        <dd class="ma0 pv2">${value}</dd>
      </dl>
    `
      })

    return html`
      <div class="flex flex-wrap f6 mh2">
        ${items}
      </div>
    `
  }

  function footer () {
    return html`
      <div class="flex flex-auto w-100 bg-black f7 pa2 justify-end">
        <a href="https://resonate.is" class="charcoalGrey no-underline" target="_blank" rel="noopener noreferer">report</a>
      </div>
    `
  }

  function renderStreamCosts () {
    if (!state.user.uid) return
    return html`
      <div class="flex pa3 f7">
        ${streamCosts({ count, status })}
      </div>
    `
  }

  function buyButton (track) {
    return html`
      <button
        aria-label="This button increments track play count"
        title="This button increments track play count"
        onclick=${(e) => {
    e.preventDefault() // prevent dialog to close
    return emit('track', {
      track,
      buy: true,
      origin: 'playlist'
    })
  }}
        class="buy-btn green b--green ba bw1 br0 bg-transparent grow pt2 pb2 pl3 pr3"
      >
        Buy track
      </button>
    `
  }

  function renderButtons (track) {
    if (!state.user.uid) return

    const status = parseInt(track.status, 10)

    if (status === 2 || track.count >= 9) {
      return html`
        <div class="flex flex-auto">
          ${downloadButton({ track }, state, emit)}
        </div>
      `
    }

    return html`
      <div class="flex flex-auto">
        ${buyButton(track)}
      </div>
      `
  }

  function renderTags (tags) {
    return html`
      <ul class="flex flex-wrap list ma0 pa0 dib">
        ${tags.map(tag => html`
          <li class="pv1 ph2 mv1 mr1 bgLightGrey black f7 br-pill di">
            <a
              onclick=${(e) => destroyDialog()}
              href="/search/${tag.trim().toLowerCase()}"
              class="black dim no-underline">
              ${tag}
            </a>
          </li>
        `).slice(0, 6)}
      </ul>
    `
  }
}
