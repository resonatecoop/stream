const morph = require('nanomorph')
const html = require('nanohtml')
const Dialog = require('@resonate/dialog-component')
const icon = require('@resonate/icon-element')
const button = require('@resonate/button')
const logger = require('nanologger')
const log = logger('menu-options')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
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
    this.onUpdate = typeof props.onUpdate === 'function' ? props.onUpdate : () => {}

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

    const createPlaylistButton = new Button('create-playlist-btn', this.state, this.emit)

    const { title, cover, creator_id: creatorId, artist, track_id: id } = this.local.track
    const src = cover || imagePlaceholder(400, 400)

    return html`
      <div class="flex flex-column">
        <div class="flex flex-auto w-100 mb4">
          <div class="flex flex-column flex-auto w-33">
            <div class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray" href="/track/${id}">
              <figure class="ma0">
                <img src=${src} decoding="auto" class="aspect-ratio--object z-1">
                <figcaption class="clip">${title}</figcaption>
              </figure>
            </div>
          </div>
          <div class="flex flex-auto flex-column w-100 items-start justify-center">
            <span class="f3 fw1 lh-title pl3 near-black">${title}</span>
            <span class="f4 fw1 pt2 pl3 dark-gray">
              <a href="/artist/${creatorId}" class="link">${artist}</a>
            </span>
          </div>
        </div>
        <div class="flex mb2">
          <div class="relative mr2">
            <label for="title" class="f5 absolute dark-gray" style="bottom:100%">Playlist Title</label>
            ${titleInput}
          </div>
          <div>
            ${createPlaylistButton.render({
              onClick: async (e) => {
                e.preventDefault()
                e.stopPropagation()

                createPlaylistButton.disable('Please wait...')

                try {
                  let response = await this.state.apiv2.tracks.findOne({
                    id: this.local.track.id
                  })

                  response = await this.state.apiv2.user.trackgroups.create({
                    title: this.local.title,
                    cover: response.data.cover_metadata.id,
                    type: 'playlist'
                  })

                  if (response.data) {
                    response = await this.state.apiv2.user.trackgroups.addItems({
                      id: response.data.id,
                      tracks: [
                        {
                          track_id: this.local.track.id
                        }
                      ]
                    })

                    this.emit('notify', {
                      timeout: 5000,
                      type: response.data ? 'success' : 'warning',
                      message: 'A new playlist was created'
                    })
                  } else {
                    // log this
                    this.emit('notify', {
                      timeout: 5000,
                      type: 'warning',
                      message: response.message
                    })
                  }

                  this.rerender()
                  this.onUpdate()
                } catch (err) {
                  this.emit('error', err)
                }

                return false
              },
              type: 'button',
              text: 'Create playlist',
              disabled: false,
              style: 'none',
              outline: true,
              theme: 'light',
              prefix: 'bg-white black bn ph3 h-100'
            })}
          </div>
        </div>
      </div>
    `
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
    this.local.track = props.track
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

        morph(this.element.querySelector('.list'), this.renderResults({
          items: this.local.filtred || []
        }))
      }
    })

    return html`
      <div class="flex flex-column">
        ${this.state.cache(CreatePlaylistForm, 'create-playlist-form').render({
          track: this.local.track,
          onUpdate: async () => {
            let response = await this.state.apiv2.user.trackgroups.find({
              type: 'playlist',
              limit: 20,
              includes: this.local.track.id
            })

            const selection = response.data.map((item) => {
              return item.id
            })

            // get all user playlists
            response = await this.state.apiv2.user.trackgroups.find({
              type: 'playlist',
              limit: 20
            })

            this.local.selection = selection
            this.local.items = response.data || []

            morph(this.element.querySelector('.list'), this.renderResults({
              items: this.local.items || []
            }))
          }
        })}
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
          ${this.renderResults({ items: this.local.filtred })}
        </div>
      </div>
    `
  }

  renderResults (props) {
    const { items } = props

    return html`
      <ul class="list ma0 pa0 pb3 flex flex-column">
        ${items.sort((a, b) => a.title.localeCompare(b.title))
        .map((item, index) => {
          const { id, title, items } = item

          const totalDuration = items.reduce((acc, obj) => { return acc + obj.track.duration }, 0)

          const attrs = {
            onchange: async (e) => {
              const val = e.target.value // val is a trackgroup id
              const checked = !!e.target.checked

              try {
                if (checked && this.local.selection.indexOf(val) < 0) {
                  // this.local.selection.push(val)

                  await this.state.apiv2.user.trackgroups.addItems({
                    id: val,
                    tracks: [
                      {
                        track_id: this.local.track_id
                      }
                    ]
                  })
                } else {
                  // this.local.selection.splice(this.local.selection.indexOf(val), 1)

                  await this.state.apiv2.user.trackgroups.removeItems({
                    id: val,
                    tracks: [
                      {
                        track_id: this.local.track_id
                      }
                    ]
                  })
                }

                let response = await this.state.apiv2.user.trackgroups.find({
                  type: 'playlist',
                  limit: 20,
                  includes: this.local.track.id
                })

                const selection = response.data.map((item) => {
                  return item.id
                })

                // get all user playlists
                response = await this.state.apiv2.user.trackgroups.find({
                  type: 'playlist',
                  limit: 20
                })

                this.local.selection = selection
                this.local.items = response.data || []

                morph(this.element.querySelector('.list'), this.renderResults({
                  items: this.local.items || []
                }))
              } catch (err) {
                this.emit('error', err)
              }
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
        iconName: 'info',
        text: 'Artist Page',
        actionName: 'profile',
        updateLastAction: data => {
          const { creator_id: id } = data.track
          return emit(state.events.PUSHSTATE, `/artist/${id}`)
        }
      },
      {
        iconName: 'plus',
        text: 'Add to playlist',
        actionName: 'playlist',
        disabled: false,
        updateLastAction: async data => {
          if (!state.user.uid) {
            state.redirect = state.href
            return emit(state.events.PUSHSTATE, '/login')
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
              title: 'Add to playlist',
              prefix: 'dialog-default dialog--sm',
              content: html`
              <div class="flex flex-column w-100">
                ${state.cache(FilterAndSelectPlaylist, 'filter-select-playlist').render({
                  track: data.track,
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
        iconName: 'star',
        text: '...', // default text
        disabled: true, // disable button
        actionName: 'favorite',
        updateLastAction: async data => {
          if (!resolved) return false

          const id = data.track.id

          if (!state.user.uid) {
            state.redirect = state.href
            return emit(state.events.PUSHSTATE, '/login')
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
        iconName: local.count > 8 ? 'download' : 'counter',
        text: local.count > 8 ? 'download' : 'Buy Now',
        actionName: local.count > 8 ? 'download' : 'buy',
        disabled: local.count > 8, // TODO resolve play counts async, download option disabled
        updateLastAction: data => {
          if (local.count > 8) {
            return false
          }

          if (!state.user.uid) {
            state.redirect = state.href
            return emit(state.events.PUSHSTATE, '/login')
          }

          const dialog = state.cache(Dialog, 'buy-track-dialog')

          const { count = 0 } = data
          const { status = 'paid', title, cover, creator_id: creatorId, artist, id } = data.track

          const buyButton = new Button(`buy-button-${id}`, state, emit)

          const remaining = 9 - count

          const src = cover || imagePlaceholder(400, 400)

          const dialogEl = dialog.render({
            title: 'Buy Now',
            prefix: 'dialog-default dialog--sm',
            content: html`
              <div class="flex flex-column w-100">
                <div class="flex flex-auto w-100 mb4">
                  <div class="flex flex-column flex-auto w-33">
                    <div class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray" href="/track/${id}">
                      <figure class="ma0">
                        <img src=${src} decoding="auto" class="aspect-ratio--object z-1">
                        <figcaption class="clip">${title}</figcaption>
                      </figure>
                    </div>
                  </div>
                  <div class="flex flex-auto flex-column w-100 items-start justify-center">
                    <span class="f3 fw1 lh-title pl3 near-black">${title}</span>
                    <span class="f4 fw1 pt2 pl3 dark-gray">
                      <a href="/artist/${creatorId}" class="link">${artist}</a>
                    </span>
                  </div>
                </div>
                <div class="flex flex-row">
                  <div class="flex flex-column w-100">
                    <div class="flex">
                      <div class="flex items-start mr2">
                        ${buyButton.render({
                          disabled: count > 8 || status !== 'paid',
                          outline: true,
                          theme: 'light',
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
          const url = new URL(`/embed/tracks/${id}`, 'https://beta.resonate.is')
          const iframeSrc = url.href
          const iframeStyle = 'margin:0;border:none;width:400px;height:600px;border: 1px solid #000;'
          const embedCode = dedent`
            <iframe allow="autoplay *; encrypted-media *; fullscreen *" frameborder="0" width="400px" height="600" style="${iframeStyle}" sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation" src="${iframeSrc}"></iframe>
          `

          const copyEmbedCodeButton = button({
            prefix: 'bg-black white ma0 bn absolute z-1 top-1 right-1',
            onClick: (e) => {
              e.preventDefault()
              emit('clipboard', embedCode)
            },
            outline: true,
            theme: 'dark',
            style: 'none',
            size: 'none',
            text: 'Copy'
          })

          const href = `https://stream.resonate.coop/track/${id}`

          const copyLinkButton = button({
            prefix: 'bg-black white ma0 bn absolute z-1 top-1 right-1',
            onClick: (e) => {
              e.preventDefault()
              emit('clipboard', href)
            },
            outline: true,
            theme: 'dark',
            style: 'none',
            size: 'none',
            text: 'Copy'
          })

          const dialog = state.cache(Dialog, 'share-track-dialog')
          const { cover, title, artist, creator_id: creatorId } = data.track
          const src = cover || imagePlaceholder(400, 400)

          const dialogEl = dialog.render({
            title: 'Share',
            prefix: 'dialog-default dialog--sm',
            content: html`
              <div class="flex flex-column">
                <div class="flex flex-auto w-100 mb4">
                  <div class="flex flex-column flex-auto w-33">
                    <div class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray" href="/track/${id}">
                      <figure class="ma0">
                        <img src=${src} decoding="auto" class="aspect-ratio--object z-1">
                        <figcaption class="clip">${title}</figcaption>
                      </figure>
                    </div>
                  </div>
                  <div class="flex flex-auto flex-column w-100 items-start justify-center">
                    <span class="f3 fw1 lh-title pl3 near-black">${title}</span>
                    <span class="f4 fw1 pt2 pl3 dark-gray">
                      <a href="/artist/${creatorId}" class="link">${artist}</a>
                    </span>
                  </div>
                </div>
                <div class="relative flex flex-column">
                  <code class="sans-serif ba bg-black white pa2 flex items-center dark-gray h3">${href}</code>
                  ${copyLinkButton}
                </div>

                <h4 class="f4 fw1">Embed code</h4>

                <div class="relative flex flex-column">
                  <code class="lh-copy f5 ba bg-black white pa2 dark-gray">
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
      }
    ]
  }
}
