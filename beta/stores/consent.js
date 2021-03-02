/* global localStorage */

const Dialog = require('@resonate/dialog-component')
const cookies = require('browser-cookies')
const button = require('@resonate/button')
const link = require('@resonate/link-element')
const html = require('choo/html')

module.exports = () => {
  return (state, emitter) => {
    emitter.on('cookies:configure', configureDialog)

    emitter.on('cookies:consent', consentDialog)

    emitter.on('cookies:status', (status) => {
      state.cookieConsentStatus = status || state.cookieConsentStatus

      if (!state.cookieConsentStatus) return

      cookies.set('cookieconsent_status', state.cookieConsentStatus, { expires: 365 })

      emitter.emit('notify', {
        host: document.body,
        message: state.cookieConsentStatus === 'allow' ? 'Cookies are allowed' : 'Cookies are disabled'
      })

      if (state.cookieConsentStatus === 'deny') {
        emitter.emit('logout')
      }

      emitter.emit(state.events.RENDER)
    })

    emitter.on(state.events.DOMCONTENTLOADED, () => {
      state.cookieConsentStatus = cookies.get('cookieconsent_status')

      if (!state.cookieConsentStatus && localStorage !== null) {
        emitter.emit('cookies:consent')
      }
    })

    function configureDialog () {
      const dialog = state.cache(Dialog, 'configure-dialog')

      const dialogEl = dialog.render({
        title: 'Configure cookies',
        prefix: 'dialog-default dialog--sm',
        content: html`
          <div class="flex flex-column">
            <h3 class="fw1 f4 lh-title">Disabling cookies.</h3>

            <p class="lh-copy f5 b">Functional cookies are enabled by default.</p>

            <p class="lh-copy f5">Functional cookies are used to keep you logged in for a while, remember your theme settings and redirects you to a different home page.</p>

            <p class="lh-copy f5 b">Disable functional cookies only if you expect Resonate to not persist your session.</p>

            <div class="flex flex-auto items-center justify-center mr5-l">
              <div class="mr4 mr2-l">
                ${button({ size: 'none', theme: 'light', outline: true, type: 'submit', value: 'deny', text: 'Deny all' })}
              </div>
              <div>
                ${button({ size: 'none', theme: 'light', outline: true, type: 'submit', value: 'allow', text: 'Allow all' })}
              </div>
            </div>

            <h3 class="fw1 f4 lh-title">Third party cookies.</h3>

            <p class="lh-copy f5">We currently don't make any use of third party tracking tools or analytics.</p>

            <p class="lh-copy f5">If you're topping up credits, you should understand payments are processed by Stripe.</p>
          </div>
        `,
        onClose: function (e) {
          const val = dialogEl.returnValue

          emitter.emit('cookies:status', val)
          dialog.destroy()
        }
      })

      document.body.appendChild(dialogEl)
    }

    function consentDialog () {
      const dialog = state.cache(Dialog, 'consent-dialog')

      const dialogEl = dialog.render({
        prefix: 'dialog-bottom bg-white black',
        content: html`
          <div class="flex flex-column flex-row-l pv2">
            <div class="flex items-center flex-auto">
              <p class="lh-copy pl3 pr5">
                To ensure you get the best experience <b>${process.env.APP_DOMAIN}</b> uses cookies. ${link({ prefix: 'link underline dib', href: 'https://resonate.is/cookie-policy', target: '_blank', text: 'Learn more' })}.
              </p>
            </div>
            <div class="flex flex-auto items-center justify-center mr5-l">
              <div class="mr4 mr2-l">
                ${button({ size: 'none', theme: 'light', outline: true, type: 'submit', value: 'deny', text: 'Deny all' })}
              </div>
              <div class="mr4 mr2-l">
                ${button({ size: 'none', theme: 'light', outline: true, type: 'submit', value: 'allow', text: 'Allow all' })}
              </div>
              <div>
                ${button({ size: 'none', theme: 'light', outline: true, type: 'submit', value: 'configure', text: 'Configure' })}
              </div>
            </div>
          </div>
        `,
        onClose: function (e) {
          const val = dialogEl.returnValue

          if (val === 'configure') {
            emitter.emit('cookies:configure')
            return dialog.destroy()
          }

          emitter.emit('cookies:status', val)
          dialog.destroy()
        }
      })

      document.body.appendChild(dialogEl)
    }
  }
}
