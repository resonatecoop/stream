const Component = require('choo/component')
const compare = require('nanocomponent/compare')
const html = require('choo/html')
const Loader = require('@resonate/play-count-component')
const Playlist = require('@resonate/playlist-component')
const nanostate = require('nanostate')
const clone = require('shallow-clone')
const renderMessage = require('../../elements/message')
const imagePlaceholder = require('@resonate/svg-image-placeholder')
const MenuButtonOptions = require('@resonate/menu-button-options-component')

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
              const {
                various = false,
                creator_id: creatorId,
                display_artist: displayArtist,
                title,
                items = [],
                cover,
                slug
              } = item

              const cid = `${this._name}-album-playlist-${index}`

              let albumCover = html`
                <div role="img" style="background:url(${cover || imagePlaceholder(400, 400)}) no-repeat;"
                     class="aspect-ratio--1x1 bg-dark-gray bg-center cover z-1">
                </div>
              `
              let albumTitle = title

              // Make the album cover and title a link if a slug was provided
              if (slug) {
                const albumLink = `/artist/${creatorId}/release/${slug}`

                albumCover = html`<a class="db" href="${albumLink}">${albumCover}</a>`
                albumTitle = html`<a class="link" href="${albumLink}">${albumTitle}</a>`
              }

              return html`
                <div class="flex flex-column flex-auto mb6">
                  <article class="flex flex-column flex-row-ns flex-auto items-start">
                    <div class="flex flex-column mw4-ns mw5-l w-100 mb5 mb0-ns relative">
                      ${albumCover}
                      <div class="flex items-center absolute z-1 right-0 mr1-ns" style="top:100%">
                        ${this.state.cache(MenuButtonOptions, `menu-button-options-discography-item-${slug}`).render({
                          items: [], // no custom items yet
                          selection: ['share', 'profile'],
                          data: {
                            creator_id: creatorId,
                            cover: cover,
                            title: title,
                            artist: displayArtist,
                            url: new URL(`/artist/${creatorId}/release/${slug}`, 'https://' + process.env.APP_DOMAIN).href
                          },
                          orientation: 'topright'
                        })}
                      </div>
                    </div>
                    <div class="flex flex-column w-100 flex-auto pt2-ns pl3-ns pt3-l pl5-l">
                      <header>
                        <div class="flex flex-column">
                          <h3 class="ma0 lh-title f3 fw4 normal">
                            ${albumTitle}
                          </h3>
                          <div>
                            ${displayArtist}
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
  }

  update (props) {
    return compare(this.local.items, props.items) ||
      this.local.name !== props.name
  }
}

module.exports = Discography
