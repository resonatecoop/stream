const Component = require('choo/component')
const compare = require('nanocomponent/compare')
const html = require('choo/html')
const Loader = require('@resonate/play-count-component')
const Playlist = require('@resonate/playlist-component')
const nanostate = require('nanostate')
const clone = require('shallow-clone')
const renderMessage = require('../../elements/message')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
const button = require('@resonate/button')
const Dialog = require('@resonate/dialog-component')
const dedent = require('dedent')
const MenuButton = require('@resonate/menu-button')

/*
 * Trackgroups (ep, lp, single) discography
 * with sharable releases
 */

class Discography extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit

    this.local = state.components[id] = Object.create({
      machine: nanostate('idle', {
        idle: { start: 'loading' },
        loading: { resolve: 'data', reject: 'error', reset: 'idle' },
        data: { reset: 'idle', start: 'loading' },
        error: { reset: 'idle', start: 'loading' }
      }),
      events: nanostate.parallel({
        loader: nanostate('off', {
          on: { toggle: 'off' },
          off: { toggle: 'on' }
        })
      })
    })

    this.local.items = []

    this.local.machine.event('notFound', nanostate('notFound', {
      notFound: { start: 'idle' }
    }))

    this.local.events.on('loader:toggle', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.on('notFound', () => {
      if (this.element) this.rerender()
    })

    this.local.machine.on('error', () => {
      if (this.element) this.rerender()
    })
  }

  createElement (props) {
    const { items = [], name } = props

    this.local.name = name
    this.local.items = clone(items)

    const machine = {
      idle: () => {},
      loading: {
        off: () => {},
        on: () => {
          const loader = new Loader('loader', this.state, this.emit).render({
            count: 3,
            options: { animate: true, repeat: true, reach: 9, fps: 10 }
          })

          return html`
            <div class="flex flex-column flex-auto items-center justify-center h5">
              ${loader}
            </div>
          `
        }
      }[this.local.events.state.loader],
      data: () => {
        const cids = this.local.items.map((item, index) => `${this._name}-album-playlist-${index}`)

        for (const cid of cids) {
          this.state.cache(Playlist, cid)
          const component = this.state.components[cid]
          component.machine.emit('start')
          component.machine.emit('resolve')
        }

        return html`
          <ul class="list ma0 pa0">
            ${this.local.items.map((item, index) => {
              const { various = false, display_artist: artist, title, items = [], cover: src, user = {}, slug } = item
              const cid = `${this._name}-album-playlist-${index}`

              return html`
                <div class="flex flex-column flex-auto mb6">
                  <article class="flex flex-column flex-row-l flex-auto">
                    <div class="flex flex-column mw5-m mw5-l mb2 w-100">
                      <div class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray">
                        <span role="img" style="background:url(${src || imagePlaceholder(400, 400)}) no-repeat;" class="bg-center cover aspect-ratio--object z-1">
                        </span>
                        ${renderMenuButton({
                          data: item,
                          items: [
                            {
                              iconName: 'info',
                              text: 'Artist Page',
                              actionName: 'profile',
                              updateLastAction: data => {
                                const { creator_id: id } = data
                                return this.emit(this.state.events.PUSHSTATE, `/artist/${id}`)
                              }
                            },
                            {
                              iconName: 'share',
                              text: 'Share',
                              actionName: 'share',
                              updateLastAction: data => {
                                const { cover, title, display_artist: artist, creator_id: creatorId, slug } = data
                                const url = new URL(`/embed/artist/${creatorId}/release/${slug}`, 'https://beta.stream.resonate.coop')
                                const iframeSrc = url.href
                                const iframeStyle = 'margin:0;border:none;width:400px;height:600px;border: 1px solid #000;'
                                const embedCode = dedent`
                                  <iframe width="400px" height="600" frameborder="0" style="${iframeStyle}" src="${iframeSrc}"></iframe>
                                `

                                const copyEmbedCodeButton = button({
                                  prefix: 'bg-black white ma0 bn absolute z-1 top-1 right-1',
                                  onClick: (e) => {
                                    e.preventDefault()
                                    this.emit('clipboard', embedCode)
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
                                    this.emit('clipboard', href)
                                  },
                                  outline: true,
                                  theme: 'dark',
                                  style: 'none',
                                  size: 'none',
                                  text: 'Copy'
                                })

                                const dialog = this.state.cache(Dialog, 'share-release-dialog')
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
                          ]
                        })}
                      </div>
                    </div>
                    <div class="flex flex-column flex-auto pt3-l pl5-l">
                      <header>
                        <div class="flex flex-column">
                          <h3 class="ma0 lh-title f3 fw4 normal">
                            ${slug ? html`<a class="link" href="/artist/${user.id}/release/${slug}">${title}</a>` : title}
                          </h3>
                          <div>
                            ${artist}
                          </div>
                        </div>
                      </header>
                      ${this.state.cache(Playlist, cid).render({
                        type: 'album',
                        various: various,
                        playlist: items
                      })}
                    </div>
                  </article>
                </div>
              `
            })}
          </ul>
        `
      },
      notFound: () => renderMessage({ message: `${name} has yet to upload music on Resonate.` }),
      error: () => renderMessage({ message: 'Failed to fetch albums' })
    }[this.local.machine.state]

    return html`
      <div class="flex flex-column flex-auto w-100">
        ${machine()}
      </div>
    `

    function renderMenuButton (options) {
      const { data, orientation = 'top', items: menuItems, open } = options
      const menuButton = new MenuButton(`release-menu-button-${data.slug}`)

      return html`
        <div class="menu_button flex items-center absolute z-1 right-0" style="top:100%">
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

  update (props) {
    return compare(this.local.items, props.items) ||
      this.local.name !== props.name
  }
}

module.exports = Discography
