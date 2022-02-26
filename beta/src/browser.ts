/* global localStorage */
import { isBrowser } from 'browser-or-node'
import plugins from '@resonate/choo-plugins'

export const browser = async (app): Promise<void> => {
  if (!isBrowser) return

  if (localStorage !== null) {
    localStorage.DISABLE_NANOTIMING = process.env.DISABLE_NANOTIMING === 'yes'
    localStorage.logLevel = process.env.LOG_LEVEL
  }

  await import('web-animations-js/web-animations.min')

  if (process.env.NODE_ENV !== 'production' && localStorage !== null) {
    const devtools = await import('choo-devtools')
    app.use(devtools.default())
  }

  if (process.env.NODE_ENV !== 'production') {
    const swclear = await import('choo-service-worker/clear')
    app.use(swclear.default())
  }

  const serviceworker = await import('choo-service-worker')
  app.use(serviceworker.default('/sw.js', { scope: '/' }))

  if ('Notification' in window) {
    const notification = await import('choo-notification')
    app.use(notification.default())
  }

  app.use(plugins.theme())
  app.use(plugins.tabbing())
  app.use(plugins.offlineDetect())
  app.use(plugins.visibility())
}
