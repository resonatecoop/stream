const assert = require('assert')
// choo
const Nanocomponent = require('nanocomponent')
const html = require('nanohtml')
const morph = require('nanomorph')
const nanostate = require('nanostate')
const nanologger = require('nanologger')

// components
const MenuButton = require('@resonate/menu-button-component')
const Dialog = require('@resonate/dialog-component')
const Button = require('@resonate/button-component')

// elements
const icon = require('@resonate/icon-element')
const input = require('@resonate/input-element')
const button = require('@resonate/button')
const TimeElement = require('@resonate/time-element')
const imagePlaceholder = require('@resonate/svg-image-placeholder')

// utils
const dedent = require('dedent')
const compare = require('nanocomponent/compare')
const clone = require('shallow-clone')
const isEqual = require('is-equal-shallow')
const { formatCredit, calculateRemainingCost, calculateCost } = require('@resonate/utils')

const { getAPIServiceClient, getAPIServiceClientWithAuth } = require('@resonate/api-service')({
  apiHost: process.env.APP_HOST || 'https://stream.resonate.coop'
})

// Create playlist form component to create a playlist
class CreatePlaylistForm extends Nanocomponent {
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
                  const client = await getAPIServiceClient('tracks')
                  const result = await client.getTrack({
                    id: this.local.track.id
                  })

                  const { body: response } = result
                  const { data: trackData } = response

                  if (trackData) {
                    const getClient = getAPIServiceClientWithAuth(this.state.user.token)
                    const client = await getClient('trackgroups')
                    const result = await client.createTrackgroup({
                      trackgroup: {
                        title: this.local.title,
                        cover: trackData.cover_metadata.id,
                        type: 'playlist'
                      }
                    })

                    const { body: response } = result
                    const { data: trackgroupData } = response

                    if (trackgroupData) {
                      const result = await client.addTrackgroupItems({
                        id: trackgroupData.id,
                        trackgroupItemsAdd: {
                          tracks: [
                            {
                              track_id: this.local.track.id
                            }
                          ]
                        }
                      })

                      const { body: response } = result

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
                  }
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

// Filter and select playlist component to add or remove tracks from a playlist
// TODO move to its own component package?
class FilterAndSelectPlaylist extends Nanocomponent {
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
            try {
              const getClient = getAPIServiceClientWithAuth(this.state.user.token)
              const client = await getClient('trackgroups')

              // get user playlists containing a specific track
              const result = await client.getTrackgroups({
                type: 'playlist',
                limit: 20,
                includes: this.local.track.id
              })

              const { body: response } = result
              const { data: trackgroups } = response

              if (response.data) {
                const selection = trackgroups.map((item) => {
                  return item.id
                })

                // get all user playlists
                const result = await client.getTrackgroups({
                  type: 'playlist',
                  limit: 20
                })

                const { body: response } = result

                this.local.selection = selection
                this.local.items = response.data || []

                morph(this.element.querySelector('.list'), this.renderResults({
                  items: this.local.items || []
                }))
              }
            } catch (err) {
              console.log(err)
            }
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
        ${items.sort((a, b) => a.title.localeCompare(b.title)).map((item, index) => {
          const { id, title, items } = item

          const totalDuration = items.reduce((acc, obj) => { return acc + obj.track.duration }, 0)

          const attrs = {
            onchange: async (e) => {
              const val = e.target.value // val is a trackgroup id
              const checked = !!e.target.checked

              try {
                const getClient = getAPIServiceClientWithAuth(this.state.user.token)
                const client = await getClient('trackgroups')

                if (checked && this.local.selection.indexOf(val) < 0) {
                  await client.addTrackgroupItems({
                    id: val,
                    trackgroupItemsAdd: {
                      tracks: [
                        {
                          track_id: this.local.track.id
                        }
                      ]
                    }
                  })
                } else {
                  await client.removeTrackgroupItems({
                    id: val,
                    trackgroupItemsRemove: {
                      tracks: [
                        {
                          track_id: this.local.track.id
                        }
                      ]
                    }
                  })
                }

                const result = await client.getTrackgroups({
                  type: 'playlist',
                  limit: 20,
                  includes: this.local.track.id
                })

                const { body: response } = result
                const { data: trackgroups } = response

                if (trackgroups) {
                  const selection = trackgroups.map((item) => {
                    return item.id
                  })

                  // get all user playlists
                  const result = await client.getTrackgroups({
                    type: 'playlist',
                    limit: 20
                  })

                  const { body: response } = result

                  this.local.selection = selection
                  this.local.items = response.data || []

                  morph(this.element.querySelector('.list'), this.renderResults({
                    items: this.local.items || []
                  }))
                }
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

/**
 * @description Default and optional component menu button items
 * @param {Object} state Choo state
 * @param {Function} emit Choo emit (nanobus)
 */

function menuButtonItems (state, emit) {
  return [
    {
      iconName: 'info',
      text: 'Artist Page',
      actionName: 'profile',
      updateLastAction: profileAction
    },
    {
      iconName: 'plus',
      text: 'Add to playlist',
      actionName: 'playlist',
      updateLastAction: addToPlaylistAction
    },
    {
      iconName: 'star',
      text: 'Unfavorite', // default text
      actionName: 'unfavorite',
      updateLastAction: favoriteAction
    },
    {
      iconName: 'star',
      text: 'Favorite',
      actionName: 'favorite',
      updateLastAction: favoriteAction
    },
    {
      iconName: 'download',
      text: 'Download',
      actionName: 'download',
      disabled: true, // download not enabled yet
      updateLastAction: () => {} // noop
    },
    {
      iconName: 'counter',
      text: 'Buy now',
      actionName: 'buy',
      updateLastAction: buyAction
    },
    {
      iconName: 'share',
      text: 'Share',
      actionName: 'share',
      updateLastAction: shareAction
    }
  ]

  /**
   * @description Redirect user to creator profile
   * @param {Object} data Action data (should contains track data)
   * @param {Number} data.creator_id Creator id
   */

  function profileAction (data) {
    const { creator_id: id } = data
    return emit(state.events.PUSHSTATE, `/artist/${id}`)
  }

  /**
   * @description Add a track to a playlist
   * @param {Object} data Action data (should contains track data)
   * @param {Number} data.id Track id
   */

  async function addToPlaylistAction (data) {
    const dialog = state.cache(Dialog, 'playlist-dialog')
    const { id } = data

    try {
      const getClient = getAPIServiceClientWithAuth(state.user.token)
      const client = await getClient('trackgroups')

      // get the playlists where the track id is already in
      const result = await client.getTrackgroups({
        type: 'playlist',
        limit: 20,
        includes: id
      })

      const { body: response } = result
      const { data: trackgroups } = response

      if (trackgroups) {
        const selection = trackgroups.map((item) => {
          return item.id
        })

        // get all user playlists
        const result = await client.getTrackgroups({
          type: 'playlist',
          limit: 20
        })

        const { body: response } = result

        const dialogEl = dialog.render({
          title: 'Add to/remove from playlist',
          prefix: 'dialog-default dialog--sm',
          content: html`
            <div class="flex flex-column w-100">
              ${state.cache(FilterAndSelectPlaylist, 'filter-select-playlist').render(Object.assign({}, data, {
                track: {
                  title: data.title,
                  id: data.id,
                  cover: data.cover,
                  creator_id: data.creator_id
                },
                selection: selection,
                items: response.data || []
              }))}
            </div>
          `,
          onClose: function (e) {
            dialog.destroy()
          }
        })

        document.body.appendChild(dialogEl)
      }
    } catch (err) {
      emit('error', err)
    }
  }

  /**
   * @description Display sharing dialog with buttons to copy paste current url and embed link
   * @param {Object} data Action data
   * @param {String} data.url The url to share
   * @param {String} data.cover The cover image src (playlist, track, release...)
   * @param {String} data.title The title (playlist, track, release, ...)
   * @param {String} data.artist The artist display name
   * @param {Number} data.creator_id The creator id
   */

  function shareAction (data) {
    const { url, cover, title, artist, creator_id: creatorId } = data
    const { protocol, pathname, href, hostname } = new URL(url)
    const { href: iframeSrc } = new URL('/embed' + pathname, protocol + '//' + hostname)
    const iframeStyle = 'margin:0;border:none;width:400px;height:600px;border: 1px solid #000;'
    const embedCode = dedent`
      <iframe src="${iframeSrc}" frameborder="0" width="400px" height="600" style="${iframeStyle}"></iframe>
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
    const src = cover || imagePlaceholder(400, 400)

    const dialogEl = dialog.render({
      title: 'Share',
      prefix: 'dialog-default dialog--sm',
      content: html`
        <div class="flex flex-column">
          <div class="flex flex-auto w-100 mb4">
            <div class="flex flex-column flex-auto w-33">
              <div class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray">
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
            <code class="overflow-hidden f5 ba bg-black white pa2 flex items-center dark-gray h3">${href}</code>
            ${copyLinkButton}
          </div>

          <h4 class="f4 fw1">Embed code</h4>

          <div class="relative flex flex-column">
            <code class="overflow-hidden f5 lh-copy ba bg-black white pa2 dark-gray">
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

  /**
   * @description Send request to buy a track
   * @param {Object} data Action data
   * @param {Number} data.id The track id
   * @param {Number} data.count The track play count
   * @param {String} data.status The track status (free, paid)
   * @param {String} data.title The track title
   * @param {String} data.cover The track cover image src
   * @param {Number} data.creator_id The track creator id
   * @param {String} data.artist The artist display name
   */

  async function buyAction (data) {
    const { id, count = 0, status = 'paid', title, cover, creator_id: creatorId, artist } = data
    const dialog = state.cache(Dialog, 'buy-track-dialog')
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

    /**
     * @param {String} status The track status (paid, free)
     * @param {Number} count Current play count
     */

    function renderCosts (status, count) {
      if (count > 8) {
        return html`
          <p class="lh-copy f5">
            You already own this track! You may continue to stream this song for free.
          </p>
        `
      }

      if (status === 'paid') {
        const cost = calculateRemainingCost(count)
        const toEur = (cost / 1022 * 1.25).toFixed(2)
        const currentStreamCost = calculateCost(count)
        const nextStreamCost = calculateCost(count + 1)

        return html`
          <div class="flex flex-auto flex-wrap flex-row">
            <dl class="mr3">
              <dt>Total remaining cost</dt>
              <dd class="ma0 b">
                ${formatCredit(cost)}
                <span class="f6">€${toEur}</span>
              </dd>
            </dl>
            <dl class="mr3">
              <dt>Current stream</dt>
              <dd class="ma0 b">${formatCredit(currentStreamCost)}</dd>
            </dl>
            <dl>
              <dt>Next stream</dt>
              <dd class="ma0 b">${formatCredit(nextStreamCost)}</dd>
            </dl>
          </div>
        `
      }

      return html`<p class="lh-copy f5">This track is free!</p>`
    }
  }

  /**
   * @description Toggle favorite track status (v1 api)
   * @param {Object} data Action data
   * @param {Number} data.id The track id
   */

  async function favoriteAction (data) {
    const { id } = data

    try {
      const response = await state.api.users.favorites.toggle({
        uid: state.user.uid,
        tid: id
      })

      if (response.data) {
        data.favorite = !!response.data.type

        morph(document.querySelector('.favorite-action'), html`
          <div class="favorite-action flex items-center">
            ${icon('star', { size: 'sm', class: 'fill-black' })}
            <span class="pl2">${data.favorite ? 'Unfavorite' : 'Favorite'}</span>
          </div>
        `)

        emit('notify', {
          message: response.data.type === 1 ? 'Track added to favorites' : 'Track removed from favorites'
        })
      }
    } catch (error) {
      emit('notify', {
        message: 'Failed to set favorite'
      })
    }
  }
}

// Menu button options component class
class MenuButtonOptionsComponent extends Nanocomponent {
  /***
   * Create a menu button options component
   * @param {string} id - The menu button options component id (unique)
   * @param {number} state - The choo app state
   * @param {function} emit - Emit event on choo app
   */
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit

    this.local = state.components[id] = {}

    this.local.machine = nanostate.parallel({
      dialog: nanostate('close', {
        open: { close: 'close' },
        close: { open: 'open' }
      })
    })

    this.local.machine.on('dialog:open', () => {
      const self = this
      const dialog = this.state.cache(Dialog, 'menu-button-options-dialog')
      const handleKeyPress = (e) => {
        if (e.keyCode === 13) {
          const actionName = e.target.control.value
          const item = this.local.menuItems.find(item => item.actionName === actionName)
          if (item) {
            const callback = item.updateLastAction
            callback(this.local.data)
          }
          this.local.machine.emit('dialog:close')
          dialog.destroy()
        }
      }
      const dialogEl = dialog.render({
        prefix: 'dialog-bottom dialog--sm',
        content: html`
          <div>
            <ul class="list ma0 pa0 flex flex-column">
              ${self.local.menuItems.map(item => {
                const { text, iconName, disabled = false, actionName } = item

                return html`
                  <li class="bg-white hover-bg-light-gray black flex items-center w-100 b--light-gray bw bb">
                    <label tabindex="0" onkeypress=${handleKeyPress} for=${actionName} class="db pa3 f4 w-100 ${disabled ? 'o-50' : ''}">
                      <div class="flex items-center">
                        ${icon(iconName, { size: 'sm', class: 'fill-black' })}
                        <span class="pl2">${text}</span>
                      </div>
                    </label>
                    <input class="dn o-0" type="submit" name=${actionName} id=${actionName} value=${actionName}>
                  </li>
                `
              })}
            </ul>
          </div>
        `,
        onClose: function (e) {
          const actionName = this.element.returnValue || e.target.returnValue
          const item = self.local.menuItems.find(item => item.actionName === actionName)
          if (item) {
            const callback = item.updateLastAction
            callback(self.local.data)
          }
          self.local.machine.emit('dialog:close')
          this.destroy()
        }
      })

      document.body.appendChild(dialogEl)
    })

    this.logger = nanologger(id)
  }

  /***
   * Create menu button options component element
   * @param {Object} props - The menu button options component props
   * @param {Array} props.selection - List of menu button actions to use
   * @param {Object} props.data - Data
   * @param {Array.<{
   *   iconName: String,
   *   text: String,
   *   actionName: Array,
   *   disabled: Boolean,
   *   updateLastAction: Function
   * }>} props.items Custom menu button options items
   * @param {String} props.orientation Menu button directional position
   * @param {String} props.size Menu button size sm|md|lg
   * @param {String} props.iconName Menu button svg icon name
   */
  createElement (props) {
    assert(props.data !== null && typeof props.data === 'object', 'props.data must be an object')
    assert(Array.isArray(props.selection), 'props.selection must be an array')

    const menuButton = new MenuButton(this._name + '-button') // needs to be unique
    const items = menuButtonItems(this.state, this.emit) // common to all menu button options items

    this.local.selection = clone(props.selection)
    this.local.data = Object.assign({}, props.data) // local state for action
    this.local.menuItems = [
      ...items,
      {
        iconName: 'clipboard',
        text: 'Copy link',
        actionName: 'clipboard',
        updateLastAction: data => {
          const { url } = data
          if (!url) return
          try {
            const { href } = new URL(url)
            this.emit('clipboard', href) // assuming this event exists
          } catch (err) { console.log(err) }
        }
      },
      {
        iconName: 'share',
        text: 'Share',
        actionName: 'webshare',
        updateLastAction: async (data) => {
          if (navigator.share && !window.safari) {
            // Web Share API is supported and is not desktop safari
            try {
              await navigator.share({
                title: this.data.title || this.state.title,
                url: this.data.url
              })
            } catch (err) {
              console.log(err)
            }
          } else {
            console.log('Falling back')
            // fallback
            const { updateLastAction } = items.find(item => item.actionName === 'share')
            updateLastAction(data)
          }
        }
      }
    ]

    // filter default items we need
    this.local.menuItems = this.local.selection.length
      ? this.local.menuItems.filter(item => this.local.selection.includes(item.actionName))
      : this.local.menuItems

    this.local.menuItems = [...this.local.menuItems, ...props.items] // add custom items

    this.local.orientation = props.orientation || 'left'
    this.local.iconName = props.iconName || 'dropdown'
    this.local.hover = props.hover || false
    this.local.size = props.size || 'md' // button size

    // returns alternate menu-button|dialog-component-button
    return html`
      <div>
        <div class="db dn-l relative">
          ${button({
            iconName: 'dropdown',
            title: 'Open mobile menu',
            size: this.local.size,
            style: 'blank',
            onclick: () => {
              this.local.machine.emit('dialog:open')
            }
          })}
        </div>
        <div class="menu_button dn db-l relative">
          ${menuButton.render({
            hover: this.local.hover, // disable activation on mousehover (default:false)
            items: this.local.menuItems, // merged custom items with default items
            updateLastAction: (actionName) => {
              const item = this.local.menuItems.find(item => item.actionName === actionName)
              if (item) {
                const { updateLastAction: callback } = item // rename this function
                callback(this.local.data)
              }
            },
            title: 'Menu button',
            id: `menu-button-${this.local.data.id}`,
            orientation: this.local.orientation, // popup menu orientation left topright bottomright
            size: this.local.size, // button size
            style: 'blank',
            iconName: this.local.iconName
          })}
        </div>
      </div>
    `
  }

  beforerender () {
    this.logger.info('menu button options element will render')
  }

  /***
   * Menu button options component on load event handler
   * @param {Object} el - The menu button options component element
   */
  load (el) {
    this.logger.info('element loaded')
  }

  /***
   * Menu button options component unload event handler
   * @param {Object} props - The menu button options component props
   */
  unload () {
    this.logger.info('element unloaded')
  }

  /***
   * Menu button options on update event handler
   * @param {Object} props - The menu button options component props
   * @returns {Boolean} Should update
   */
  update (props) {
    this.logger.info('element got updates')
    return compare(this.local.selection, props.selection) ||
      !isEqual(this.local.data, props.data)
  }
}

module.exports = MenuButtonOptionsComponent
