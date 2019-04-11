const setTitle = require('../../lib/title')
const TITLE = setTitle('Browse All Labels')
const raw = require('choo/html/raw')
const html = require('choo/html')
const Albums = require('../../components/albums')
const Artists = require('../../components/artists')
const ProfileHeader = require('../../components/profile-header')
const ProfileHeaderImage = require('../../components/profile-header-image')
const socialLinks = require('../../elements/social-buttons')
const viewLayout = require('../../elements/view-layout')

module.exports = LabelView

function LabelView () {
  return (state, emit) => {
    state.title = state.title || 'Labels'

    const id = parseInt(state.params.uid, 10)

    const profileHeader = state.cache(ProfileHeader, 'profile-header').render({
      data: state.label.data
    })

    const image = state.label.data.avatar || {}
    const profileHeaderImage = state.cache(ProfileHeaderImage, `profile-header-image-${id}`).render({
      cover: image['cover']
    })

    const artists = state.cache(Artists, 'label-artists-' + id).render({
      items: state.label.artists || [],
      shuffle: true,
      pagination: false
    })

    const albums = state.cache(Albums, 'label-albums-' + id).render({
      items: state.label.albums || [],
      limit: 5
    })

    const { name, description: body, links = [] } = state.label.data

    return viewLayout((state, emit) => html`
      <section id="label-profile" class="flex flex-column flex-auto w-100">
        <section id="label-header" class="w-100">
          ${profileHeaderImage}
          ${profileHeader}
        </section>
        <section id="content" class="flex flex-column flex-auto w-100 pb6">
          <section id="label-artists" class="flex-auto mh3">
            <h2 class="lh-title">Artists</h2>
            ${artists}
          </section>
          <section id="label-albums" class="flex-auto mh3">
            <h2 class="lh-title">Albums</h2>
            ${albums}
          </section>
          <section id="bio" class="flex-auto mh3">
            <h4 class="f4">Bio</h4>
            <div class="flex flex-column flex-row-ns">
              <article class="w-100 mw6">
                ${body ? raw(body) : html`<span class="dark-gray">${name} has not provided a biography yet.</span>`}
              </article>
              <aside id="links" class="ml3-ns mt2">
                ${socialLinks(links)}
              </aside>
            </div>
          </section>
        </section>
      </section>
    `
    )(state, emit)
  }
}
