const html = require('choo/html')
const button = require('@resonate/button')
const viewLayout = require('../../layouts/default')

module.exports = () => viewLayout(renderSettings)

function renderSettings (state, emit) {
  const enableNotificationButton = button({
    disabled: state.notification.permission,
    onClick: (e) => emit('notification:request'),
    outline: true,
    text: state.notification.permission ? 'Enabled' : 'Enable',
    size: 'none'
  })

  const cookiesOptions = button({
    onClick: (e) => emit('cookies:consent'),
    outline: true,
    text: 'Update',
    size: 'none'
  })

  const cookieConsentGranted = state.cookieConsentStatus === 'allow'
  const iOS = (navigator !== undefined && 'userAgent' in navigator) &&
    (navigator.userAgent.match(/iOS/) ||
    (navigator.userAgent.match(/Mac/) && document !== undefined && 'ontouchend' in document))

  const notificationsSection = html`
    <div class="bg-light-gray bg-light-gray--light bg-transparent--dark ba b--gray b--gray--light b--near-black--dark mb3 pa3">
      <fieldset class="pa0 ma0 bn">
        <legend class="f3 lh-title ma0 pa0">Notifications</legend>
        <div class="mt2 mb4">
          <label for="notify" class="f5 lh-copy db mb2 required">${!state.notification.permission ? 'Native notifications are disabled' : 'Native notifications are enabled. To change this configuration, update your site settings for ' + process.env.APP_DOMAIN}.</label>
          ${enableNotificationButton}
        </div>
      </fieldset>
    </div>
  `

  const cookieConsentSection = html`
    <div class="bg-light-gray bg-light-gray--light bg-transparent--dark ba b--gray b--gray--light b--near-black--dark mb3 pa3">
      <fieldset class="pa0 ma0 bn">
        <legend class="f3 lh-title ma0">Cookie consent</legend>
        <div class="mt2 mb4">
          <label for="cache" class="f5 lh-copy db mb2 required">Cookies are ${cookieConsentGranted ? 'allowed' : 'disabled'}</label>
          ${cookiesOptions}
          ${!cookieConsentGranted
            ? html`
            <br>
            <br>
            <p class="lh-copy f5 b">Disable functional cookies only if you expect Resonate to not persist your session.</p>
            `
            : ''
            }
        </div>
      </fieldset>
    </div>
  `

  return html`
    <section id="app-settings" class="flex flex-column ph4 mt3">
      ${!iOS ? notificationsSection : ''}
      ${cookieConsentSection}
    </section>
  `
}
