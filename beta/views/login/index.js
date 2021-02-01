const html = require('choo/html')
const Login = require('../../components/forms/login')
const viewLayout = require('../../layouts/default')

const ASSETS_PATH = 'https://static.resonate.is/pwa_assets'

const src = ASSETS_PATH + '/Knowyourcooperator_gif_transparent.webm'

module.exports = () => viewLayout(renderLogin)

function renderLogin (state, emit) {
  return html`
    <div class="flex flex-column flex-row-l flex-auto w-100">
      <div class="flex flex-column flex-auto w-100 items-center justify-center min-vh-100 pt6 pb6">
        <div class="w-100 w-auto-l ph4 pt4 pb3">
          <div class="flex flex-column flex-auto">
            <h2 class="f3 fw1 mt2 near-black near-black--light light-gray--dark lh-title">Log In</h2>
            ${state.cache(Login, 'login').render({
              passwordResetLink: process.env.PASSWORD_RESET_URL || 'https://resonate.is/password-reset/'
            })}
          </div>
        </div>
      </div>
      <div class="flex flex-auto w-100">
        <div class="fl w-100">
          <div class="db aspect-ratio aspect-ratio--1x1">
            <video width="400" height="400" autoplay loop muted playsinline class="aspect-ratio--object z-1 invert--dark">
              <source src=${src} type="video/webm">
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </div>
  `
}
