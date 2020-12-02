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
const {
  formatCredit,
  calculateRemainingCost,
  calculateCost
} = require('@resonate/utils')

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
  let resolved

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

            morph(el.querySelector('.favorite-action'), renderActionItem(fav.type))
          } else {
            morph(el.querySelector('.favorite-action'), renderActionItem())
          }
        } catch (err) {
          console.log(err)
        }
      } else {
        morph(el.querySelector('.favorite-action'), renderActionItem())
      }

      resolved = true

      function renderActionItem (fav) {
        return html`
          <div class="favorite-action flex items-center">
            ${icon('star', { size: 'sm', class: 'fill-black' })}
            <span class="pl2">${fav === 1 ? 'unfavorite' : 'favorite'}</span>
          </div>
        `
      }
    },
    items: [
      {
        iconName: 'star',
        text: '...', // default text
        disabled: true, // disable button
        actionName: 'favorite',
        updateLastAction: async function (data) {
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
        iconName: 'star',
        text: 'Add to playlist',
        actionName: 'playlist',
        disabled: false,
        updateLastAction: function (data) {
          const dialog = state.cache(Dialog, 'playlist-dialog')

          const dialogEl = dialog.render({
            title: 'Add to playlist',
            prefix: 'dialog-default dialog--sm',
            content: html`
              <div class="flex flex-column w-100">
                Create playlist
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
        iconName: local.count > 8 ? 'download' : 'counter',
        text: local.count > 8 ? 'download' : 'buy now',
        actionName: local.count > 8 ? 'download' : 'buy',
        disabled: local.count > 8, // TODO resolve play counts async, download option disabled
        updateLastAction: function (data) {
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
        text: 'share',
        actionName: 'share',
        updateLastAction: function (data) {
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
        text: 'artist profile',
        actionName: 'profile',
        updateLastAction: (data) => {
          const id = data.track.creator_id || data.trackGroup[0].id // why id is an artist id ?
          return emit(state.events.PUSHSTATE, `/artist/${id}`)
        }
      }
    ]
  }
}
