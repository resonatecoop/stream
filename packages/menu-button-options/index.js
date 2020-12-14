const morph = require('nanomorph')
const html = require('nanohtml')
const Dialog = require('@resonate/dialog-component')
const icon = require('@resonate/icon-element')
const button = require('@resonate/button')
const logger = require('nanologger')
const log = logger('menu-options')
const link = require('@resonate/link-element')
const Button = require('@resonate/button-component')
const dedent = require('dedent')
const Component = require('choo/component')
const compare = require('nanocomponent/compare')
const input = require('@resonate/input-element')
const TimeElement = require('@resonate/time-element')
const clone = require('shallow-clone')
const {
  formatCredit,
  calculateRemainingCost,
  calculateCost
} = require('@resonate/utils')

const renderFavoriteActionItem = (fav) => {
  return html`
    <div class="favorite-action flex items-center">
      ${icon('star', { size: 'sm', class: 'fill-black' })}
      <span class="pl2">${fav === 1 ? 'Unfavorite' : 'Favorite'}</span>
    </div>
  `
}

const renderRemainingCost = (count) => {
  const cost = calculateRemainingCost(count)
  const toEur = (cost / 1022 * 1.25).toFixed(2)
  return html`
    <div>
      ${formatCredit(cost)}
      <span class="f6">€${toEur}</span>
    </div>
  `
}

const renderCost = (count) => {
  const cost = calculateCost(count)
  return formatCredit(cost)
}

class CreatePlaylistForm extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit

    this.local = state.components[id] = {}
  }

  createElement (props) {
    this.local.track = props.track
    this.local.title = props.track.title

    const titleInput = input({
      name: 'title',
      placeholder: 'Playlist title',
      theme: 'dark',
      value: this.local.title,
      onchange: (e) => {
        this.local.title = e.target.value
      },
      required: true
    })

    const createPlaylistButton = new Button('create-playlist-btn')

    return html`
      <div class="flex mb2">
        <div class="mr2">
          ${titleInput}
        </div>
        <div>
          ${createPlaylistButton.render({
            onClick: async (e) => {
              e.preventDefault()
              e.stopPropagation()

              createPlaylistButton.disable('Please wait...')

              try {
                let response = await this.state.apiv2.tracks.findOne({ id: this.local.track.id })

                response = await this.state.apiv2.user.trackgroups.create({
                  title: this.local.title,
                  release_date: '2020-01-01',
                  cover: response.data.cover_metadata.id,
                  type: 'playlist'
                })

                this.emit('playlist:add', { track_id: this.local.track.id, playlist_id: response.data.id, title: this.local.title })

                console.log('created playlist')
              } catch (err) {
                this.emit('error', err)
              }

              return false
            },
            type: 'button',
            text: 'Create playlist',
            style: 'none',
            outline: true,
            theme: 'light',
            prefix: 'bg-white black bn ph3 h-100'
          })}
        </div>
      </div>
    `
  }

  load () {

  }

  update () {
    return false
  }
}

class FilterAndSelectPlaylist extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit

    this.local = state.components[id] = {}

    this.local.filtred = []
    this.local.results = []
    this.local.selection = []
    this.local.input = ''

    this.renderResults = this.renderResults.bind(this)
  }

  createElement (props) {
    this.local.items = props.items || []
    this.local.track_id = props.track_id
    this.local.selection = props.selection || []

    const filterInput = input({
      name: 'filter',
      placeholder: this.local.items.slice(0, 2).map((item) => item.title).join(', '),
      value: this.local.input,
      classList: 'indent',
      theme: 'light',
      required: false,
      onInput: (e) => {
        this.local.input = e.target.value

        this.local.filtred = this.local.items.filter((item) => {
          if (!item.title) return false
          return item.title.toLowerCase().includes(this.local.input.toLowerCase())
        })

        this.rerender()
      }
    })

    return html`
      <div class="flex flex-column">
        <div class="sticky z-1 top-0">
          <div class="flex relative">
            <label class="search-label flex absolute z-1" for="search" style="left:.5rem;top:50%;transform:translateY(-50%) scaleX(-1);">
              ${icon('search')}
            </label>
            ${filterInput}
          </div>
        </div>
        <div class="flex ph2 w-100 items-center flex-auto">
          <div class="flex w1 h1 flex-shrink-0">
          </div>
          <div class="flex flex-auto w-100">
            <span class="pl2">Title</span>
          </div>
          <div class="flex flex-auto w-100">
            <div class="flex flex-auto w-100">
              <span>Total</span>
            </div>
            <div class="flex flex-auto w-100">
              <span>Length</span>
            </div>
          </div>
        </div>
        ${this.renderResults(this.local.filtred)}
      </div>
    `
  }

  renderResults (items) {
    return html`
      <ul id="items" class="list ma0 pa0 pb3 flex flex-column">
        ${items.sort((a, b) => a.title.localeCompare(b.title))
        .map((item, index) => {
          const { id, title, items } = item

          const totalDuration = items.reduce((acc, obj) => { return acc + obj.track.duration }, 0)

          const attrs = {
            onchange: (e) => {
              const val = e.target.value // val is a trackgroup id
              const checked = !!e.target.checked

              if (checked && this.local.selection.indexOf(val) < 0) {
                this.local.selection.push(val)

                this.emit('playlist:add', { track_id: this.local.track_id, playlist_id: val, title })
              } else {
                this.local.selection.splice(this.local.selection.indexOf(val), 1)
                this.emit('playlist:remove', { track_id: this.local.track_id, playlist_id: val, title })
              }

              morph(this.element.querySelector('#items'), this.renderResults(this.local.filtred))
            },
            checked: this.local.selection.includes(id) ? 'checked' : false,
            id: `playlist-${id}`,
            name: 'playlist',
            value: id,
            class: 'o-0 clip',
            style: 'width:0;height:0;',
            type: 'checkbox'
          }

          return html`
            <li class="lh-copy pv1 mb1">
              <input ${attrs}>
              <label class="flex items-center w-100 dim" tabindex="0" onkeypress=${handleKeyPress} for="playlist-${id}">
                <div class="flex ph2 w-100 items-center flex-auto">
                  <div class="flex w1 h1 items-center justify-center flex-shrink-0 ba bw b--mid-gray">
                    ${icon('check', { class: 'fill-transparent' })}
                  </div>
                  <div class="flex flex-auto w-100">
                    <span class="truncate pl2">${title}</span>
                  </div>
                  <div class="flex flex-auto w-100">
                    <div class="flex flex-auto w-100">
                      <span>${items.length}</span>
                    </div>
                    <div class="flex flex-auto w-100">
                      <span>${TimeElement(totalDuration)}</span>
                    </div>
                  </div>
                </div>
              </label>
            </li>
          `
        })}
      </ul>
    `

    function handleKeyPress (e) {
      if (e.keyCode === 13) {
        e.preventDefault()
        e.target.control.checked = !e.target.control.checked
      }
    }
  }

  load () {
    this.local.filtred = clone(this.local.items)
    this.rerender()
  }

  update (props) {
    if (compare(this.local.items, props.items)) {
      this.local.filtred = clone(props.items)
      return true
    }
    if (compare(this.local.selection, props.selection)) {
      return true
    }
  }
}

const renderCosts = (status, count) => {
  if (count > 8) {
    return html`<p class="lh-copy f5">You already own this track! You may continue to stream this song for free.</p>`
  }
  if (status === 'paid') {
    return html`
      <div class="flex flex-auto flex-wrap flex-row">
        <dl class="mr3">
          <dt>Total remaining cost</dt>
          <dd class="ma0 b">${renderRemainingCost(count)}</dd>
        </dl>

        <dl class="mr3">
          <dt>Current stream</dt>
          <dd class="ma0 b">${renderCost(count)}</dd>
        </dl>

        <dl>
          <dt>Next stream</dt>
          <dd class="ma0 b">${renderCost(count + 1)}</dd>
        </dl>
      </div>
    `
  }
  return html`<p class="lh-copy f5">This track is free!</p>`
}

module.exports = (state, emit, local) => {
  let resolved // favorite resolved ?

  return {
    open: async function (el, controller) {
      if (state.user.uid) {
        const trackId = local.track.id

        try {
          const response = await state.api.users.favorites.resolve({
            uid: state.user.uid,
            ids: [trackId]
          })

          if (response.data) {
            const fav = response.data.find((item) => item.tid === trackId)

            morph(el.querySelector('.favorite-action'), renderFavoriteActionItem(fav.type))
          } else {
            morph(el.querySelector('.favorite-action'), renderFavoriteActionItem())
          }
        } catch (err) {
          emit('error', err)
        }
      } else {
        morph(el.querySelector('.favorite-action'), renderFavoriteActionItem())
      }

      resolved = true
    },
    items: [
      {
        iconName: 'star',
        text: '...', // default text
        disabled: true, // disable button
        actionName: 'favorite',
        updateLastAction: async data => {
          if (!resolved) return false

          const id = data.track.id

          if (!state.user.uid) {
            return emit(state.events.PUSHSTATE, '/login', { redirect: state.href })
          }

          try {
            const response = await state.api.users.favorites.toggle({
              uid: state.user.uid,
              tid: id
            })

            if (response.data) {
              const fav = response.data.type === 1

              emit('notify', {
                message: fav ? 'Track added to favorites' : 'Track removed from favorites'
              })
            }
          } catch (error) {
            log.error(error)

            emit('notify', {
              message: 'Failed to set favorite'
            })
          }
        }
      },
      {
        iconName: 'plus',
        text: 'Add to playlist',
        actionName: 'playlist',
        disabled: false,
        updateLastAction: async data => {
          if (!state.user.uid) {
            return emit(state.events.PUSHSTATE, '/login', { redirect: state.href })
          }

          const dialog = state.cache(Dialog, 'playlist-dialog')
          const id = data.track.id

          try {
            // get the playlists where the track id is already in
            let response = await state.apiv2.user.trackgroups.find({
              type: 'playlist',
              limit: 20,
              includes: id
            })

            const selection = response.data.map((item) => {
              return item.id
            })

            // get all user playlists
            response = await state.apiv2.user.trackgroups.find({
              type: 'playlist',
              limit: 20
            })

            const dialogEl = dialog.render({
              title: `Add '${data.track.title}' to a playlist`,
              prefix: 'dialog-default dialog--sm',
              content: html`
              <div class="flex flex-column w-100">
                ${state.cache(CreatePlaylistForm, 'create-playlist-form').render({
                  track: data.track
                })}

                ${state.cache(FilterAndSelectPlaylist, 'filter-select-playlist').render({
                  track_id: id,
                  selection: selection,
                  items: response.data || []
                })}
              </div>
            `,
              onClose: function (e) {
                dialog.destroy()
              }
            })

            document.body.appendChild(dialogEl)
          } catch (err) {
            emit('error', err)
          }
        }
      },
      {
        iconName: local.count > 8 ? 'download' : 'counter',
        text: local.count > 8 ? 'download' : 'buy now',
        actionName: local.count > 8 ? 'download' : 'buy',
        disabled: local.count > 8, // TODO resolve play counts async, download option disabled
        updateLastAction: data => {
          if (local.count > 8) {
            return false
          }

          if (!state.user.uid) {
            return emit(state.events.PUSHSTATE, '/login', { redirect: state.href })
          }

          const dialog = state.cache(Dialog, 'buy-track-dialog')

          const { count = 0 } = data
          const { status = 'paid', id, title } = data.track
          const artist = data.trackGroup[0].display_artist

          const buyButton = new Button(`buy-button-${id}`, state, emit)

          const remaining = 9 - count

          const dialogEl = dialog.render({
            title: `Buy ${title} by ${artist}`,
            prefix: 'dialog-default dialog--sm',
            content: html`
              <div class="flex flex-column w-100">
                <div class="flex flex-row">
                  <div class="flex flex-column w-100">
                    <div class="flex">
                      <div class="flex items-start mr2">
                        ${buyButton.render({
                          disabled: count > 8 || status !== 'paid',
                          text: 'Buy now',
                          onClick: (e) => {
                            buyButton.disable()
                            emit('track:buy', id)
                          }
                        })}

                        <p class="lh-copy f5 ma0 pa0 pl2">You are <b>${remaining}</b> plays away from owning this track. *</p>
                      </div>
                    </div>

                    ${renderCosts(status, count)}

                    <p class="lh-copy f6">* Download option is currently unavailable.</p>
                  </div>
                </div>
              </div>

            `,
            onClose: function (e) {
              dialog.destroy()
            }
          })

          document.body.appendChild(dialogEl)
        }
      },
      {
        iconName: 'share',
        text: 'Share',
        actionName: 'share',
        updateLastAction: data => {
          const id = data.track.id
          const iframeSrc = `https://beta.resonate.is/embed/tracks/${id}`
          const iframeStyle = 'margin:0;border:none;width:400px;height:600px;border: 1px solid #000;'
          const embedCode = dedent`
            <iframe src=${iframeSrc} style=${iframeStyle}></iframe>
          `

          const copyEmbedCodeButton = button({
            prefix: 'bg-black white ma0 bn absolute top-0 right-0 dim',
            onClick: (e) => {
              e.preventDefault()
              emit('clipboard', embedCode)
            },
            style: 'none',
            size: 'none',
            text: 'Copy'
          })

          const dialog = state.cache(Dialog, 'share-track-dialog')

          const dialogEl = dialog.render({
            title: 'Share or embed',
            prefix: 'dialog-default dialog--sm',
            content: html`
              <div class="flex flex-column">
                <p class="lh-copy">Use the following link to send this track to someone</p>

                ${link({
                  href: `https://beta.resonate.is/tracks/${id}`,
                  prefix: 'link b',
                  text: `beta.resonate.is/tracks/${id}`,
                  onClick: (e) => {
                    e.preventDefault()
                    emit('clipboard', `https://beta.resonate.is/tracks/${id}`)
                  }
                })}

                <p class="lh-copy">To embed this track, copy the following code into an html page or webform</p>

                <div class="relative flex flex-column">
                  <code class="ba bw b--gray pa2 f7">
                    ${embedCode}
                  </code>
                  ${copyEmbedCodeButton}
                </div>
              </div>
            `,
            onClose: function (e) {
              dialog.destroy()
            }
          })

          document.body.appendChild(dialogEl)
        }
      },
      {
        iconName: 'info',
        text: 'Artist Page',
        actionName: 'profile',
        updateLastAction: data => {
          const { creator_id: id } = data.track
          return emit(state.events.PUSHSTATE, `/artist/${id}`)
        }
      }
    ]
  }
}
