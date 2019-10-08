const Dialog = require('@resonate/dialog-component')
const cookies = require('browser-cookies')
const { isBrowser } = require('browser-or-node')
const button = require('@resonate/button')
const link = require('@resonate/link-element')
const html = require('choo/html')

module.exports = () => {
  return (state, emitter) => {
    if (!isBrowser) return

    const status = cookies.get('cookieconsent_status')
    state.cookieConsentStatus = status

    emitter.on(state.events.DOMCONTENTLOADED, () => {
      if (!status) {
        openDialog()
      }

      emitter.on('cookies:openDialog', () => openDialog())

      emitter.on('cookies:setStatus', (status) => {
        state.cookieConsentStatus = status || state.cookieConsentStatus
        if (!state.cookieConsentStatus) return

        cookies.set('cookieconsent_status', state.cookieConsentStatus, { expires: 365 })

        emitter.emit('notify', {
          host: document.body,
          message: state.cookieConsentStatus === 'allow' ? 'Cookies are allowed' : 'Cookies are disabled'
        })

        emitter.emit(state.events.RENDER)
      })
    })

    function openDialog () {
      const dialog = state.cache(Dialog, 'consent-dialog')

      const dialogEl = dialog.render({
        prefix: 'dialog-bottom bg-white black',
        content: html`
          <div class="flex flex-column flex-row-l pv2">
            <div class="flex items-center flex-auto">
              <p class="lh-copy pl3 pr5">
                To ensure you get the best experience <b>beta.resonate.is</b> uses cookies. ${link({ prefix: 'link underline dib', href: 'https://resonate.is/cookie-policy', target: '_blank', text: 'Learn more' })}.
              </p>
            </div>
            <div class="flex flex-auto items-center justify-center mr4">
              <div class="mr4">
                ${button({ size: 'none', type: 'submit', value: 'decline', text: 'Decline' })}
              </div>
              <div>
                ${button({ size: 'none', type: 'submit', value: 'allow', text: 'Allow cookies' })}
              </div>
            </div>
          </div>
        `,
        onClose: function (e) {
          emitter.emit('cookies:setStatus', dialogEl.returnValue)
          dialog.destroy()
        }
      })

      document.body.appendChild(dialogEl)
    }
  }
}
