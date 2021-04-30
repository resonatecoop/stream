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
                artist, title,
                items = [],
                cover,
                user = {},
                slug
              } = item

              const cid = `${this._name}-album-playlist-${index}`

              return html`
                <div class="flex flex-column flex-auto mb6">
                  <article class="flex flex-column flex-row-l flex-auto">
                    <div class="flex flex-column mw5-m mw5-l mb2 w-100">
                      <div class="db aspect-ratio aspect-ratio--1x1 bg-dark-gray">
                        <span role="img" style="background:url(${cover || imagePlaceholder(400, 400)}) no-repeat;" class="bg-center cover aspect-ratio--object z-1">
                        </span>
                        ${this.state.cache(MenuButtonOptions, `menu-button-options-release-${slug}`).render({
                          items: [], // no custom items yet
                          selection: ['share', 'profile'],
                          data: {
                            creator_id: creatorId,
                            cover: cover,
                            title: title,
                            artist: displayArtist,
                            url: new URL(this.state.href, 'https://beta.stream.resonate.coop')
                          }
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
  }

  update (props) {
    return compare(this.local.items, props.items) ||
      this.local.name !== props.name
  }
}

module.exports = Discography
