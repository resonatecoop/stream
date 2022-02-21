module.exports = async (machine, timeout = 300) => {
  await new Promise((resolve) => {
    return setTimeout(() => {
      machine.state.loader === 'off' && machine.emit('loader:toggle')
      resolve()
    }, timeout)
  })
}
