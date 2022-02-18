const apiFactoryGenerator = require('@resonate/api-factory-generator')

/**
 * REST API configuration
 * @param {object} options Options for apiFactoryGenerator
 */
const generateApi = (opts = {}) => {
  const defaultOptions = {
    scheme: 'https://',
    domain: process.env.API_DOMAIN || 'api.resonate.localhost',
    prefix: (process.env.API_PREFIX || '') + '/v' + (opts.version || 1),
    auth: true,
    version: 1
  }

  const options = Object.assign({}, defaultOptions, opts)

  return apiFactoryGenerator({
    payments: {
      retrieveIntent: {
        path: '/users/[:uid]/payment/intent/retrieve',
        options: {
          method: 'POST'
        },
        schema: {
          type: 'object',
          properties: {
            uid: {
              type: 'number'
            },
            pi: {
              type: 'string'
            }
          }
        }
      },
      confirmIntent: {
        path: '/users/[:uid]/payment/intent/confirm',
        options: {
          method: 'POST'
        },
        schema: {
          type: 'object',
          properties: {
            uid: {
              type: 'number'
            },
            pi: {
              type: 'string'
            },
            payment_method: {
              type: 'string'
            }
          }
        }
      },
      cancelIntent: {
        path: '/users/[:uid]/payment/intent/cancel',
        options: {
          method: 'POST'
        },
        schema: {
          type: 'object',
          properties: {
            uid: {
              type: 'number'
            },
            pi: {
              type: 'string'
            },
            reason: {
              type: 'string',
              enum: ['requested_by_customer', 'abandoned']
            }
          }
        }
      },
      createIntent: {
        path: '/users/[:uid]/payment/intent/create',
        options: {
          method: 'POST'
        },
        schema: {
          type: 'object',
          properties: {
            uid: {
              type: 'number'
            },
            tokens: {
              type: 'number',
              enum: [4088, 8176, 16352, 40880, 81760]
            },
            currency: {
              type: 'string',
              enum: ['EUR', 'USD']
            },
            vat: {
              type: 'boolean'
            }
          }
        }
      },
      updateIntent: {
        path: '/users/[:uid]/payment/intent/update',
        options: {
          method: 'POST'
        },
        schema: {
          type: 'object',
          properties: {
            uid: {
              type: 'number'
            },
            pi: {
              type: 'string'
            },
            tokens: {
              type: 'number',
              enum: [4088, 8176, 16352, 40880, 81760]
            },
            currency: {
              type: 'string',
              enum: ['EUR', 'USD']
            },
            vat: {
              type: 'boolean'
            }
          }
        }
      },
      captureIntent: {
        path: '/users/[:uid]/payment/intent/capture',
        options: {
          method: 'POST'
        },
        schema: {
          type: 'object',
          properties: {
            uid: {
              type: 'number'
            },
            pi: {
              type: 'string'
            }
          }
        }
      }
    },
    plays: {
      buy: {
        path: '/users/[:uid]/plays/buy',
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
      },
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
    },
    auth: {
      logout: {
        path: '/oauth2/logout'
      },
      user: {
        path: '/oauth2/user'
      },
      tokens: {
        path: '/oauth2/tokens',
        options: {
          method: 'POST'
        },
        schema: {
          type: 'object',
          properties: {
            access_token: {
              type: 'string',
              format: 'uuid'
            }
          }
        }
      },
      login: {
        path: '/oauth2/password',
        options: {
          method: 'POST'
        },
        schema: {
          type: 'object',
          properties: {
            username: {
              type: 'string'
            },
            password: {
              type: 'string'
            }
          }
        }
      }
    }
  }, options)
}

module.exports = generateApi
