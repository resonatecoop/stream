const SwaggerClient = require('swagger-client')
const LRU = require('nanolru')
const cache = new LRU(100)

/**
 * @description API Service client
 * @param options
 * @returns {Function} getAPIServiceClient
 */
const APIServiceClient = (options) => {
  const {
    apiHost = 'https://beta.stream.resonate.coop',
    base = '/api/v2',
    fullClient = false
  } = options

  /**
   * @description Get swagger api definition for v2 api service and returns swagger client apis
   * @param {String} name The api service name (favorites, plays, trackgroups, ...)
   * @param {String} prefix Rest API prefix (user)
   * @param {Object} swaggerOpts Optional swagger options
   */
  return async (name, prefix = '', swaggerOpts = {}) => {
    let basePath = base

    if (prefix) {
      basePath = base + '/' + prefix
    }
    const id = name + prefix

    let client = cache.get(id)

    if (!client) {
      const url = new URL(`${basePath}/${name}/apiDocs`, apiHost)
      url.search = new URLSearchParams({
        type: 'apiDoc',
        basePath: `${basePath}/${name}`
      })

      const opts = Object.assign({
        url: url.href,
        requestInterceptor: req => {
          if (req.body && !req.headers['Content-Type']) {
            req.headers['Content-Type'] = 'application/json'
          }
        }
      }, swaggerOpts)

      client = await new SwaggerClient(opts)

      cache.set(id, client)
    }

    if (fullClient) {
      return client
    }

    return client.apis[name]
  }
}

/**
 * @description Get swagger api definition with auth
 * @param {String} token Resonate User Token
 */
const APIServiceClientWithAuth = (options) => {
  return (token, prefix = 'user') => {
    let swaggerOpts = {}

    if (token) {
      swaggerOpts = {
        authorizations: {
          Bearer: 'Bearer ' + token
        }
      }
    }

    return (name) => {
      return APIServiceClient(options)(name, prefix, swaggerOpts)
    }
  }
}

module.exports = (options) => {
  const apiService = Object.create({
    getAPIServiceClient: APIServiceClient(options),
    getAPIServiceClientWithAuth: APIServiceClientWithAuth(options)
  })

  return apiService
}
