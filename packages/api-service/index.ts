import SwaggerClient from 'swagger-client'
import LRU from 'nanolru'

const cache = new LRU(100)

interface APIServiceClientOptions {
  apiHost?: string
  base?: string
  fullClient?: boolean
}

/**
 * @description API Service client
 */
const APIServiceClient = (options: APIServiceClientOptions): Function => {
  const {
    apiHost = 'https://stream.resonate.coop',
    base = '/api/v2',
    fullClient = false
  } = options

  /**
   * @description Get swagger api definition for v2 api service and returns swagger client apis
   * @param {String} name The api service name (favorites, plays, trackgroups, ...)
   * @param {String} prefix Rest API prefix (user)
   * @param {Object} swaggerOpts Optional swagger options
   */
  return async (name: string, prefix: string = '', swaggerOpts: { authorizations?: string } = {}) => {
    let basePath = base

    if (prefix) {
      basePath = base + '/' + prefix
    }
    const auth = swaggerOpts.authorizations ? 'auth' : 'noauth'
    const id = name + prefix + auth

    let client = cache.get(id)

    if (!client) {
      const url = new URL(`${basePath}/${name}/apiDocs`, apiHost)
      const params = new URLSearchParams({
        type: 'apiDoc',
        basePath: `${basePath}/${name}`
      })

      url.search = `?${params.toString()}`

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

const APIServiceClientWithAuth = (options: APIServiceClientOptions): Function => {
  /**
   * @description Get swagger api definition with auth
   * @param {String} token Resonate User Token
   */
  return (token?: string, prefix: string = 'user') => {
    let swaggerOpts = {}

    if (token) {
      swaggerOpts = {
        authorizations: {
          Bearer: 'Bearer ' + token
        }
      }
    }

    return (name: string) => {
      return APIServiceClient(options)(name, prefix, swaggerOpts)
    }
  }
}

const getService = (options): { getAPIServiceClient: Function, getAPIServiceClientWithAuth: Function } => {
  return {
    getAPIServiceClient: APIServiceClient(options),
    getAPIServiceClientWithAuth: APIServiceClientWithAuth(options)
  }
}

export = getService
