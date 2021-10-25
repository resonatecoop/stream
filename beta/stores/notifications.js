const Notifications = require('../components/notifications')

module.exports = () => {
  return (state, emitter) => {
    state.messages = state.messages || []

    emitter.on(state.events.DOMCONTENTLOADED, _ => {
      emitter.on('notification:denied', () => {
        emitter.emit('notify', {
          type: 'warning',
          timeout: 6000,
          message: 'Notifications are blocked, you should modify your browser site settings'
        })
      })

      emitter.on('notification:granted', () => {
        emitter.emit('notify', {
          type: 'success',
          message: 'Notifications are enabled'
        })
      })

      emitter.on('notify', (props) => {
        const { message } = props

        if (!state.notification.permission) {
          const dialog = document.querySelector('dialog')
          const name = dialog ? 'notifications' : 'notifications-dialog'
          const notifications = state.cache(Notifications, name)
          const host = props.host || (dialog || document.body)

          if (notifications.element) {
            notifications.add(props)
          } else {
            const el = notifications.render({
              size: dialog ? 'small' : 'default'
            })
            host.insertBefore(el, host.firstChild)
            notifications.add(props)
          }
        } else {
          emitter.emit('notification:new', message)
        }
      })
    })
  }
}
