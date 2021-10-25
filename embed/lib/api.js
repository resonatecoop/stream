const apiFactoryGenerator = require('@resonate/api-factory-generator')

/**
 * REST API configuration
 * @param {object} options Options for apiFactoryGenerator
 */
const generateApi = (options) => {
  const defaultOptions = {
    scheme: 'https://',
    domain: process.env.API_DOMAIN || 'api.resonate.localhost',
    prefix: process.env.API_PREFIX || '/v1',
    version: 1
  }

  return apiFactoryGenerator({
    plays: {
      add: {
        path: '/users/[:uid]/plays',
        options: {
          method: 'POST'
        },
        schema: {
          type: 'object',
          properties: {
            uid: {
              type: 'number'
            },
            tid: {
              type: 'number'
            }
          }
        }
      }
    }
  }, Object.assign(defaultOptions, options))
}

module.exports = generateApi
