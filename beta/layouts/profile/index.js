const html = require('choo/html')
const Header = require('../../components/header')
const icon = require('@resonate/icon-element')
const ProfileHeader = require('../../components/profile-header')
const ProfileHeaderImage = require('../../components/profile-header/image')
const { background: bg } = require('@resonate/theme-skins')
const navigateToAnchor = require('../../lib/navigate-to-anchor')
const { isNode } = require('browser-or-node')

const links = [
  {
    href: '#discography',
    text: 'Discography'
  },
  {
    href: '#playlists',
    text: 'Playlists',
    kinds: ['u']
  },
  {
    href: '#biography',
    text: 'Bio'
  }
]

module.exports = LayoutProfile

/**
 * App layout
 */

function LayoutProfile (view) {
  return (state, emit) => {
    const kind = state.route.split('/')[0]
    const { data = {} } = state[kind]

    if (isNode) emit(`prefetch:${kind}`, state.params.id)

    return html`
      <div class="flex flex-column flex-auto w-100">
        ${state.cache(Header, 'header').render({
          credits: state.user ? state.user.credits : 0,
          user: state.user,
          href: state.href,
          resolved: state.resolved
        })}
        <main class="flex flex-row flex-auto w-100 pb6">
          <nav role="navigation" aria-label="Browse navigation" class="dn db-l">
            <ul class="sticky list menu ma0 pa0 flex flex-column justify-around sticky z-999" style="top:3rem">
              ${links.filter(({ kinds = [] }) => {
                if (!kinds.length) return true
                if (!kinds.includes(kind)) return false
                return true
              }).map(({ href, text }) => {
                return html`
                  <li>
                    <a class="link db dim pv2 ph4 w-100" href=${href} onclick=${navigateToAnchor}>${text}</a>
                  </li>
                `
              })}
            </ul>
          </nav>
          <div class="flex flex-column flex-auto">
            ${renderProfileHeaderImage(state)}
            <div class="sticky z-999 bg-near-black top-0 top-3-l">
              <button class="${bg} br1 bn w2 h2 ma2" onclick=${() => window.history.go(-1)}>
                <div class="flex items-center justify-center">
                  ${icon('arrow', { size: 'sm' })}
                </div>
              </button>
            </div>
            ${state.cache(ProfileHeader, 'profile-header').render(data)}
            ${view(state, emit)}
          </div>
        </main>
      </div>
    `
  }
}

function renderProfileHeaderImage (state) {
  const kind = state.route.split('/')[0]
  const data = state[kind].data

  if (!data.images) return
  if (!data.images.cover_photo) return

  const id = Number(state.params.id)

  return state.cache(ProfileHeaderImage, `profile-header-image-${id}`).render(data)
}
