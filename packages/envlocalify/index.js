const localenv = require('localenv/noload')
const path = require('path')
const envify = require('envify')
const fs = require('fs')

module.exports = envlocalify

function envlocalify (file, opts) {
  const environment = []

  if (!opts.envfile) {
    environment.push('.env')
  } else {
    environment.push(opts.envfile)
  }

  environment.forEach(env => {
    const filePath = path.resolve(process.cwd(), env)
    if (!fs.existsSync(filePath)) throw new Error(`unable to find env file ${filePath}`)

    localenv.inject_env(filePath)
  })

  return envify()
}
