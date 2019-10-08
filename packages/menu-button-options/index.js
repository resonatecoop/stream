const morph = require('nanomorph')
const html = require('nanohtml')
const Dialog = require('@resonate/dialog-component')
const icon = require('@resonate/icon-element')
const button = require('@resonate/button')
const logger = require('nanologger')
const log = logger('menu-options')
const link = require('@resonate/link-element')
const dedent = require('dedent')

module.exports = (state, emit) => {
  return {
    open: async function (el, controller) {
      if (state.user.uid) {
        const player = state.components['player-footer']
        const trackId = player.track.id

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
          const id = data.track.id

          if (state.user.uid) {
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
          } else {
            return emit(state.events.PUSHSTATE, '/login', { redirect: state.href })
          }
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
          const id = data.trackGroup[0].id // why id is an artist id ?
          return emit(state.events.PUSHSTATE, `/artists/${id}`)
        }
      }
    ]
  }
}
