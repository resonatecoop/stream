const html = require('choo/html')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
const Playlist = require('@resonate/playlist-component')
const Dialog = require('@resonate/dialog-component')
const viewLayout = require('../../layouts/trackgroup')
const button = require('@resonate/button')
const dedent = require('dedent')
const { isNode } = require('browser-or-node')
const MenuButton = require('@resonate/menu-button')

/**
 * Display a release or trackgroup (single, lp, ep)
 */

module.exports = () => viewLayout(renderRelease)

function renderRelease (state, emit) {
  if (isNode) emit('prefetch:release')

  const data = state.release.data || {}

  const { title, display_artist: displayArtist, creator_id: creatorId } = data

  return html`
    <div class="flex flex-auto flex-column flex-row-l">
      <div class="flex flex-column w-100 w-50-l flex-auto flex-row-l">
        ${renderArtwork(state, emit)}
      </div>
      <div class="flex flex-column flex-auto w-100 w-50-l ph2 ph4-l">
        <h2 class="flex flex-column f3 fw4 lh-title ma0 mt3">
          ${title}
          <small class="f5 lh-copy">
            <a href="/artist/${creatorId}" class="link">${displayArtist}</a>
          </small>
        </h2>
        ${renderContent(state, emit)}
      </div>
    </div>
  `

  function renderArtwork (state) {
    const data = state.release.data || {}

    const {
      cover,
      title
    } = data

    const src = cover || imagePlaceholder(400, 400)

    return html`
      <div class="fl w-100">
        <div class="sticky db aspect-ratio aspect-ratio--1x1 bg-gray" style="top:3rem">
          <figure class="ma0">
            <picture>
              ${cover ? html`
                <source srcset=${src.replace('.jpg', '.webp')} type="image/webp">
                <source srcset=${src.replace('.webp', '.jpg')} type="image/jpeg">
              ` : ''}
              <img src=${src} width=400 height=400 class="aspect-ratio--object z-1" />
            </picture>
            <figcaption class="clip">${title}</figcaption>
            ${renderMenuButton({
              id: state.release.data.id,
              data: state.release.data,
              items: [
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
                  iconName: 'share',
                  text: 'Share',
                  actionName: 'share',
                  updateLastAction: data => {
                    const { cover, title, display_artist: artist, creator_id: creatorId, slug } = data
                    const url = new URL(`/embed/artist/${creatorId}/release/${slug}`, 'https://stream.resonate.coop')
                    const iframeSrc = url.href
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

                    const href = `https://stream.resonate.coop/artist/${creatorId}/release/${slug}`

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

                    const dialog = state.cache(Dialog, 'share-release-dialog')
                    const src = cover || imagePlaceholder(400, 400)

                    const dialogEl = dialog.render({
                      title: 'Share',
                      prefix: 'dialog-default dialog--sm',
                      content: html`
                        <div class="flex flex-column">
                          <div class="flex flex-auto w-100 mb4">
                            <div class="flex flex-column flex-auto w-33">
                              <div class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray" href="/artist/${creatorId}/release/${slug}">
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
                            <code class="sans-serif ba bg-black white pa2 flex items-center dark-gray h3">${href}</code>
                            ${copyLinkButton}
                          </div>

                          <h4 class="f4 fw1">Embed code</h4>

                          <div class="relative flex flex-column">
                            <code class="lh-copy f5 ba bg-black white pa2 dark-gray">
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
              ],
              orientation: 'top'
            })}
          </figure>
        </div>
      </div>
    `
  }

  function renderMenuButton (options) {
    const { data, orientation = 'top', items: menuItems, open } = options
    const menuButton = new MenuButton(`release-menu-button-${state.params.slug}`)

    return html`
      <div class="menu_button flex items-center absolute z-1 right-0 mh2" style="top:100%">
        ${menuButton.render({
          hover: false, // disabled activation on mousehover
          items: menuItems,
          updateLastAction: (actionName) => {
            const callback = menuItems.find(item => item.actionName === actionName).updateLastAction
            return callback(data)
          },
          open: open,
          orientation, // popup menu orientation
          style: 'blank',
          size: 'small',
          iconName: 'dropdown' // button icon
        })}
      </div>
    `
  }
}

function renderContent (state, emit) {
  const data = state.release.data || {}

  const {
    label,
    about: story = '',
    tags = [],
    performers = [],
    composers = [],
    release_date: date
  } = data

  return html`
    <section id="release-content" class="flex flex-column flex-auto mb4">
      ${state.cache(Playlist, `release-${state.params.id}`).render({
        type: 'album',
        pagination: false,
        playlist: state.release.tracks || [],
        numberOfPages: state.numberOfPages
      })}
      <div class="flex flex-column">
        ${renderLabel(label)}
        ${renderReleaseDate(date)}
        ${renderStory(story)}
        ${renderTags(tags)}
        ${renderItems(composers, 'Composers')}
        ${renderItems(performers, 'Performers')}
      </div>
    </section>
  `
}

function renderLabel (label) {
  if (!label) return

  return html`
    <dl class="flex flex-auto w-100">
      <dt class="fw1 f5 lh-copy light-gray">Label</dt>
      <dd class="ma0 fw1 f5 lh-copy flex flex-auto justify-end">${label.name}</dd>
    </dl>
  `
}

function renderReleaseDate (date) {
  if (!date) return

  return html`
    <dl class="flex flex-auto w-100">
      <dt class="f5 lh-copy b">Year</dt>
      <dd class="ma0 fw1 f5 lh-copy pl4 flex flex-auto">${new Date(date).getFullYear()}</dd>
    </dl>
  `
}

function renderTags (items) {
  if (!items.length) return

  return html`
    <div class="flex flex-auto">
      <dl class="flex flex-column">
        <dt class="f5 b">Tags</dt>
        <dd class="ma0">
          <ul class="ma0 pa0 list flex flex-wrap">
            ${items.map((item) => {
              return html`
                <li>
                  <a class="link db ph3 pv1 near-black mr2 mv1 f5 br-pill bg-light-gray" href="/tag?term=${item}">
                    #${item}
                  </a>
                </li>
              `
            })}
          </ul>
        </dd>
      </dl>
    </div>
  `
}

function renderItems (items, title) {
  if (!items.length) return

  return html`
    <div class="flex flex-auto">
      <dl class="flex flex-wrap items-center">
        <dt class="flex-auto w-100 f5 b mr4">${title}</dt>
        ${items.map((item) => {
          return html`
            <dd class="dib f5 lh-copy commark ma0">
              <a href="/search?q=${item}" class="link">${item}</a>
            </dd>
          `
        })}
      </dl>
    </div>
  `
}

function renderStory (story) {
  if (!story) return

  return html`
    <div class="flex flex-column flex-auto">
      <p class="lh-copy f5">${story}</p>
    </div>
  `
}
