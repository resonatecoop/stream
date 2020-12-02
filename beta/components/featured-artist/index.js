const Component = require('choo/component')
const html = require('choo/html')
const button = require('@resonate/button')
const nanostate = require('nanostate')

class FeaturedArtist extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state

    this.local = state.components[id] = {}

    this.local.data = {}

    this.local.machine = nanostate.parallel({
      follow: nanostate('off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      })
    })

    this.local.machine.on('follow:toggle', () => {
      this.rerender()
    })
  }

  createElement (props = {}) {
    this.local.data = props.data

    const { display_name: displayName, creator_id: creatorId, cover, coverOrientation } = this.local.data
    const id = creatorId

    return html`
      <div class="bg-black white flex flex-column flex-row-ns items-start relative pt5 pt5-l pb4 ph0 ph4-ns">
        <div class="fl w-100 w-50-ns w-80-l grow">
          <a class="db aspect-ratio aspect-ratio--16x9 bg-dark-gray bg-dark-gray--dark" href="/artist/${id}">
            <div class="aspect-ratio--object cover" style="background:url(${cover}) ${coverOrientation || 'center'};"></div>
          </a>
        </div>
        <div class="flex flex-auto w-100 ph3 mt3 mt0-ns items-start flex-column ml2">
          <a href="/artist/${id}" class="link">
            <h3 class="ma0 mb1">
              <small class="db f6 dark-gray fw1 lh-copy ttu">Featured Artist</small>
              <span class="f2 fw2 lh-title">${displayName}</span>
            </h3>
          </a>
          ${button({
            text: this.local.machine.state.follow === 'on' ? 'Unfollow' : 'Follow',
            style: 'custom',
            prefix: 'bg-transparent ba bw b--white f7 pv1 ph2 ttu b grow',
            size: 'custom',
            onClick: () => this.local.machine.emit('follow:toggle')
          })}
        </div>
      </div>
    `
  }

  update () {
    return false
  }
}

module.exports = FeaturedArtist
