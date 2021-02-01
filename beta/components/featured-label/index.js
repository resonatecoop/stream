const Component = require('choo/component')
const html = require('choo/html')
const button = require('@resonate/button')
const nanostate = require('nanostate')

class FeaturedLabel extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state

    this.local = state.components[id] = {}

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

  createElement (props = { data: [] }) {
    if (!this.local.data) {
      this.local.data = props.data[Math.floor(Math.random() * props.data.length)] // get random item from array of labels
    }
    this.local.follow = props.follow || false // enable or diable follow feature, disabled by default

    const { display_name: displayName, creator_id: creatorId, cover } = this.local.data
    const id = creatorId

    return html`
      <div class="bg-light-gray black bg-light-gray--light black--light bg-black--dark white--dark flex flex-column pt5 pt5-l pb4 ph0 ph4-ns">
        <div class="flex flex-column flex-row-ns items-start relative">
          <div class="fl w-100 w-33-ns grow">
            <a class="db aspect-ratio aspect-ratio--3x1 bg-dark-gray bg-near-black--dark" href="/label/${id}">
              <figure class="ma0">
                <picture>
                  <img src=${cover} class="aspect-ratio--object z-1" />
                </picture>
                <figcaption class="clip">${displayName}</figcaption>
              </figure>
            </a>
          </div>
          <div class="flex flex-column flex-auto items-start w-100 ph3 mt3 mt0-ns ml2-ns">
            <a href="/label/${id}" class="link">
              <h3 class="ma0 mb1">
                <small class="db f6 dark-gray fw1 lh-copy ttu">Featured Label</small>
                <span class="f2 fw2 lh-title">${displayName}</span>
              </h3>
            </a>
            ${this.local.follow ? button({
              text: this.local.machine.state.follow === 'on' ? 'Unfollow' : 'Follow',
              style: 'custom',
              prefix: 'bg-white black ba bw b--white f7 pv1 ph2 ttu b grow',
              size: 'custom',
              onClick: () => this.local.machine.emit('follow:toggle')
            }) : ''}
          </div>
        </div>
      </div>
    `
  }

  update () {
    return false
  }
}

module.exports = FeaturedLabel
