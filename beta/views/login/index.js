const html = require('choo/html')
const Login = require('../../components/forms/login')
const subView = require('../../layouts/outside')

module.exports = loginView

function loginView () {
  return subView((state, emit) => {
    const login = state.cache(Login, 'login').render({
      passwordResetLink: process.env.PASSWORD_RESET_URL || 'https://resonate.is/password-reset/'
    })

    return html`
      <div class="flex flex-column flex-auto w-100">
        <div class="flex flex-column flex-auto items-center justify-center min-vh-100 mh3 pt6 pb6">
          <div class="bg-white black bg-black--dark white--dark bg-white--light black--light z-1 w-100 w-auto-l ph4 pt4 pb3">
            <div class="flex flex-column flex-auto">
              <h2 class="f3 fw1 mt2 near-black near-black--light light-gray--dark lh-title">Login</h2>
              ${login}
            </div>
          </div>
        </div>
      </div>
    `
  })
}
