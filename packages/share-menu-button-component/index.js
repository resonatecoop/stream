const assert = require('assert')
// choo
const Nanocomponent = require('nanocomponent')
const html = require('nanohtml')
const morph = require('nanomorph')
const nanostate = require('nanostate')
const nanologger = require('nanologger')

// components
const MenuButton = require('@resonate/menu-button') // should rename
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

// render cost remaining for play count
function renderRemainingCost (count) {
  const cost = calculateRemainingCost(count)
  const toEur = (cost / 1022 * 1.25).toFixed(2)
  return html`
    <div>
      ${formatCredit(cost)}
      <span class="f6">€${toEur}</span>
    </div>
  `
}

// render play cost
function renderCost (count) {
  const cost = calculateCost(count)
  return formatCredit(cost)
}

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

/**
 * @param {String} status The track status (paid, free)
 * @param {Number} count Current play count
 */

function renderCosts (status, count) {
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

/**
 * @description Default and optional component menu button items
 *
 * @param {Object} state Choo state
 * @param {Function} emit Choo emit (nanobus)
 */

function menuButtonItems (state, emit) {
  return [
    {
      iconName: 'info',
      text: 'Artist Page',
      actionName: 'profile',
      updateLastAction: data => {
        const { creator_id: id } = data
        return emit(state.events.PUSHSTATE, `/artist/${id}`)
      }
    },
    {
      iconName: 'plus',
      text: 'Add to playlist',
      actionName: 'playlist',
      disabled: false,
      updateLastAction: async data => {
        const dialog = state.cache(Dialog, 'playlist-dialog')
        const { id } = data

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
      text: 'unfavorite', // default text
      actionName: 'unfavorite',
      updateLastAction: async data => {
        const { id } = data

        try {
          const response = await state.api.users.favorites.toggle({
            uid: state.user.uid,
            tid: id
          })

          if (response.data) {
            emit('notify', {
              message: 'Track removed from favorites'
            })
          }
        } catch (error) {
          emit('notify', {
            message: 'Failed to set favorite'
          })
        }
      }
    },
    {
      iconName: 'star',
      text: 'favorite',
      actionName: 'favorite',
      updateLastAction: async data => {
        const { id } = data

        try {
          const response = await state.api.users.favorites.toggle({
            uid: state.user.uid,
            tid: id
          })

          if (response.data) {
            emit('notify', {
              message: 'Track added to favorites'
            })
          }
        } catch (error) {
          emit('notify', {
            message: 'Failed to set favorite'
          })
        }
      }
    },
    {
      iconName: 'download',
      text: 'Download',
      actionName: 'download',
      disabled: true,
      updateLastAction: () => {}
    },
    {
      iconName: 'counter',
      text: 'Buy now',
      actionName: 'buy',
      updateLastAction: data => {
        const { count = 0, status = 'paid', title, cover, creator_id: creatorId, artist, id } = data
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
      }
    },
    {
      iconName: 'share',
      text: 'Share',
      actionName: 'share',
      updateLastAction: data => {
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
    }
  ]
}

// Share menu button class
class ShareMenuButtonComponent extends Nanocomponent {
  /***
   * Create a share menu button component
   * @param {string} id - The share menu component id (unique)
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
      const dialog = this.state.cache(Dialog, 'share-menu-button-dialog')
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
      // open menu with some items
    })

    this.logger = nanologger(id)
  }

  /***
   * Create share menu button component element
   * @param {Object} props - The share menu button component props
   * @param {Array.<{iconName: String, text: String, actionName: Array, disabled: Boolean, updateLastAction: Function}>} props.items Custom share menu button items
   */
  createElement (props) {
    assert(props.data !== null && typeof props.data === 'object', 'props.data must be an object')
    assert(Array.isArray(props.selection), 'props.selection must be an array')

    const menuButton = new MenuButton(this._name + '-button') // needs to be unique
    const dialogButton = new Button('dialog-button')
    const items = menuButtonItems(this.state, this.emit) // common to all share menu items

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
          ${dialogButton.render({
            iconName: 'dropdown',
            title: 'Open mobile menu',
            size: 'md',
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
    this.logger.info('share menu button element will render')
  }

  /***
   * Share menu button component on load event handler
   * @param {Object} el - The share menu button component element
   */
  load (el) {
    this.logger.info('element loaded')
  }

  /***
   * Share menu button component unload event handler
   * @param {Object} props - The share menu button component props
   */
  unload () {
    this.logger.info('element unloaded')
  }

  /***
   * Share menu button component on update event handler
   * @param {Object} props - The share menu button component props
   * @returns {Boolean} Should update
   */
  update (props) {
    this.logger.info('element got updates')
    return compare(this.local.selection, props.selection) ||
      !isEqual(this.local.data, props.data)
  }
}

module.exports = ShareMenuButtonComponent
