/* global localStorage */
import { isBrowser } from 'browser-or-node'
import plugins from '@resonate/choo-plugins'
import Choo from 'choo'
import devtools from 'choo-devtools'
import serviceworker from 'choo-service-worker'
import swclear from 'choo-service-worker/clear'
import notification from 'choo-notification'

export const browser = (app: Choo): void => {
  if (!isBrowser) return

  if (localStorage !== null) {
    localStorage.DISABLE_NANOTIMING = process.env.DISABLE_NANOTIMING === 'yes'
    localStorage.logLevel = process.env.LOG_LEVEL
  }

  require('web-animations-js/web-animations.min')

  if (process.env.NODE_ENV !== 'production' && localStorage !== null) {
    app.use(devtools())
  }

  if (process.env.NODE_ENV !== 'production') {
    app.use(swclear())
  }

  app.use(serviceworker('/sw.js', { scope: '/' }))

  if ('Notification' in window) {
    app.use(notification())
  }

  app.use(plugins.theme())
  app.use(plugins.tabbing())
  app.use(plugins.offlineDetect())
  app.use(plugins.visibility())
}
