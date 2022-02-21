/**
 * Returns a timeout that when triggered sends the `loader:toggle` event.
 */
const loaderTimeout = (machine, timeout = 300): NodeJS.Timeout => {
  return setTimeout(() => {
    machine.state.loader === 'off' && machine.emit('loader:toggle')
  }, timeout)
}

export = loaderTimeout
