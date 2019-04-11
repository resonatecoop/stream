const Notifications = require('../components/notifications')

module.exports = () => {
  return (state, emitter) => {
    state.messages = state.messages || []

    emitter.on(state.events.DOMCONTENTLOADED, _ => {
      emitter.on('notification:denied', () => {
        emitter.emit('notify', { type: 'warning', timeout: 6000, message: 'Notifications are blocked, you should modify your browser site settings' })
      })

      emitter.on('notification:granted', () => {
        emitter.emit('notify', { type: 'success', message: 'Notifications are enabled' })
      })

      emitter.on('notify', notification => {
        if (!state.notification.permission) {
          const dialog = document.querySelector('dialog')
          const name = dialog ? 'notifications' : 'notifications-dialog'
          const notifications = state.cache(Notifications, name)
          const host = notification.host || dialog || document.body

          if (notifications.element) {
            notifications.add(notification)
          } else {
            const el = notifications.render()
            host.insertBefore(el, host.firstChild)
            notifications.add(notification)
          }
        } else {
          emitter.emit('notification:new', notification.message)
        }
      })
    })
  }
}
