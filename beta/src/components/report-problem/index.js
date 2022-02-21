const html = require('choo/html')
const button = require('@resonate/button')
const nanostate = require('nanostate')
const Component = require('choo/component')
const Dialog = require('@resonate/dialog-component')

class ReportProblem extends Component {
  constructor (id, state, emit) {
    super(id)

    this.state = state
    this.emit = emit

    this.local = state.components[id] = {}

    this.local.machine = nanostate.parallel({
      reportProblemDialog: nanostate('close', {
        open: { close: 'close' },
        close: { open: 'open' }
      })
    })

    this.local.machine.on('reportProblemDialog:open', () => {
      const machine = this.local.machine

      const subject = 'Beta player problem report'
      const body = `
Write your message here

Context: ${JSON.stringify(this.local.context)}
My user id: ${state.user.uid}
Current track: ${state.components['player-footer'].track.id}
Current page: ${state.href}
      `
      const encodedBody = encodeURIComponent(body)
      const dialogEl = this.state.cache(Dialog, 'report-problem-dialog').render({
        title: 'Report a problem',
        prefix: 'dialog-default dialog--sm',
        content: html`
          <p>
            <a href="mailto:members@resonate.is?subject=${subject}&body=${encodedBody}">Write to us</a>
          </p>
        `,
        onClose: function (e) {
          machine.emit('reportProblemDialog:close')
          this.destroy()
        }
      })

      document.body.appendChild(dialogEl)
    })
  }

  createElement (props) {
    this.local.context = props.context

    return html`
      <div>
        ${button({
          onClick: (e) => this.local.machine.emit('reportProblemDialog:open'),
          style: 'blank',
          text: 'Report a problem',
          outline: true
        })}
      </div>
    `
  }

  unload () {

  }

  update () {
    return false
  }
}

module.exports = ReportProblem
