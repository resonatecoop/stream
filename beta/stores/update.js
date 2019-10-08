/* global fetch */

const Dialog = require('@resonate/dialog-component')
const button = require('@resonate/button')
const html = require('choo/html')

const logger = require('nanologger')
const log = logger('updater')

const fs = require('fs')
const path = require('path')
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'))

const VERSION = pkg.version
const PACKAGE_URL = process.env.PACKAGE_URL || 'https://raw.githubusercontent.com/resonatecoop/stream2own/master/beta/package.json'

module.exports = update

function update () {
  return (state, emitter) => {
    state.version = VERSION

    emitter.on(state.events.DOMCONTENTLOADED, () => {
      emitter.on('update', update)
    })

    async function update (props = {}) {
      const { silent = true, force = false } = props

      try {
        const response = await (await fetch(PACKAGE_URL, { cache: 'no-cache' })).json()
        const version = response.version
        const shouldUpdate = (version > state.version) || force
        const preRelease = (v) => v.split('-').length > 1

        if (shouldUpdate) {
          const message = [
            `#stream2own ${version}`,
            preRelease(version) ? '(pre-release)' : false,
            'is available.',
            `You have ${state.version}.`
          ].filter(Boolean).join(' ')

          openDialog(message)
        } else {
          state.updated = true
          state.lastUpdate = new Date().getTime()

          if (!silent) {
            emitter.emit('notify', {
              timeout: 3000,
              message: `Stream2own app is up to date (${version})`
            })
          }
        }
      } catch (err) {
        log.error(err)

        if (!silent) {
          emitter.emit('notify', {
            timeout: 3000,
            message: 'Update failed'
          })
        }
      }
    }

    function openDialog (message) {
      const dialog = state.cache(Dialog, 'update-dialog')
      const dialogEl = dialog.render({
        title: 'Update available',
        prefix: 'dialog-bottom ph3 pv1 bg-white black',
        content: html`
          <div class="flex flex-column flex-row-l items-center-l pv2">
            <div class="flex items-center flex-auto">
              <p class="lh-copy pa0">${message}</p>
            </div>
            <div class="flex flex-auto items-center justify-end">
              <div class="mr3">
                ${button({ size: 'none', type: 'submit', value: 'dissmis', text: 'Later' })}
              </div>
              <div class="mr4">
                ${button({ size: 'none', type: 'submit', value: 'reload', text: 'Update now' })}
              </div>
            </div>
          </div>
        `,
        onClose: e => {
          const returnValue = e.target.value || e.target.returnValue
          if (returnValue === 'reload') {
            window.location.reload(true)
          }
          dialog.destroy()
        }
      })

      document.body.appendChild(dialogEl)
    }
  }
}
