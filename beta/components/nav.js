const html = require('choo/html')
const Nanocomponent = require('nanocomponent')
const css = require('sheetify')
const equals = require('is-equal-shallow')
const Dialog = require('./dialog')

const prefix = css`
  :host {
    top: var(--height-3);
    padding-bottom: var(--height-4);
  }
`

class Nav extends Nanocomponent {
  constructor (name, state, emit) {
    super(name)

    this.emit = emit
    this.state = state

    this.openLogoutDialog = this.openLogoutDialog.bind(this)

    this.buttons = [
      {
        handler: this.openHelpDialog,
        name: 'help'
      },
      {
        handler: this.openLogoutDialog,
        name: 'log out'
      }
    ]
  }

  createElement (props) {
    this.user = props.user

    const username = this.user.username || ''

    return html`
      <nav class="${prefix} fixed overflow-auto z-max left-0 right-0 bottom-0 pa0 h-100">
        <ul class="list ma0 pa0 w-75 br h-100">
          <li class="lh-copy bb">
            <a href="/listen" class="flex items-center pa3 color-inherit no-underline">
              listen
            </a>
          </li>
          <li>
            <a href="https://resonate.is/everything/" class="db color-inherit no-underline pa3 dropdown-toggle" target="_blank" rel="noopener noreferer">
              learn
            </a>
            <ul class="list ma0 pa0 dropdown pl2">
              <li>
                <a class="link db dim w-100 pv3 pl3" href="https://resonate.is/stream2own" target="_blank" rel="noopener noreferer">#stream2own</a>
              </li>
              <li>
                <a class="link db dim w-100 pv3 pl3" href="https://resonate.is/exploring-our-mission" target="_blank" rel="noopener noreferer">the mission</a>
              </li>
              <li>
                <a class="link db dim w-100 pv3 pl3" href="https://resonate.is/revealing-the-plan-for-growth/" target="_blank" rel="noopener noreferer">the plan</a>
              </li>
              <li>
                <a class="link db dim w-100 pv3 pl3" href="https://resonate.is/everything/" target="_blank" rel="noopener noreferer">project map</a>
              </li>
            </ul>
          </li>
          <li class="lh-copy bb">
            <a href="/${username}/profile" class="flex items-center pa3 color-inherit no-underline">
              profile
            </a>
          </li>
          <li class="lh-copy bb">
            <a href="https://resonate.is/support" class="flex items-center pa3 color-inherit no-underline" target="_blank" rel="noopener noreferer">
              support
            </a>
          </li>
          ${this.buttons.map(({ icon, name, handler }) => html`
            <li class="lh-copy bb">
              <button onclick=${handler} ontouchstart=${handler} class="usermenu tc w-100 color-inherit bg-transparent pa3 ma0">
                <div class="flex items-center">
                  ${icon}
                  ${name}
                </div>
              </button>
            </li>
          `)}
        </ul>
      </nav>
    `
  }

  openHelpDialog (e) {
    e.preventDefault()
    e.stopPropagation()

    const dialogEl = this.state.cache(Dialog, 'nav-dialog').render({
      title: 'Tips for controlling the player',
      classList: 'dialog-default dialog--sm',
      content: html`
        <div>
          <div>
            <h4>Key Controls</h4>
            <ul class="list ma0 pa0">
              <li>Left Arrow - previous track</li>
              <li>Right arrow - next track</li>
            </ul>
            <h4>Mouse Actions and Gestures</h4>
            <ul class="list ma0 pa0">
              <li>Playlist: Double Tap or Touch & Hold - view favorites and hide tracks</li>
              <li>Playlist: Swipe Down - scroll down</li>
              <li>Playlist: Swipe Up - scroll up</li>
            </ul>
          </div>
        </div>
      `
    })

    document.body.appendChild(dialogEl)
  }

  openLogoutDialog (e) {
    e.preventDefault()
    e.stopPropagation()

    const self = this

    const dialog = Dialog()
    const dialogEl = dialog.render({
      title: 'Logout',
      classList: 'dialog-default dialog--sm',
      content: html`
        <div class="flex flex-column flex-row-ns">
          <p class="ph1">Are you sure you want to logout?</p>
          <button class="br-pill white bg-green grow relative b--transparent pa2 ma2" type="submit" value="yes">Yes</button>
          <button class="br-pill white b--transparent bg-brightGrey pa2 ma2" type="submit" value="no">Cancel</button>
        </div>
      `,
      onClose: function (e) {
        if (this.element.returnValue === 'yes') {
          self.emit('logout')
        }
        this.destroy()
      }
    })

    document.body.appendChild(dialogEl)
  }

  update (props) {
    return !equals(props.user, this.user)
  }
}

module.exports = Nav
