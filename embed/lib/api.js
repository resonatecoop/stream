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
    clientId: process.env.ANON_USER,
    auth: true,
    version: 1,
    user: {
      uid: 0
    }
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
    },
    auth: {
      tokens: {
        path: '/oauth2/tokens',
        options: {
          method: 'POST'
        },
        schema: {
          type: 'object',
          properties: {
            uid: {
              type: 'number'
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
    },
    labels: {
      getAlbums: {
        path: '/labels/[:uid]/albums',
        schema: {
          type: 'object',
          properties: {
            uid: {
              type: 'number'
            }
          }
        }
      }
    },
    artists: {
      getAlbums: {
        path: '/artists/[:uid]/albums',
        schema: {
          type: 'object',
          properties: {
            uid: {
              type: 'number'
            }
          }
        }
      },
      getTracks: {
        path: '/artists/[:uid]/tracks',
        schema: {
          type: 'object',
          properties: {
            uid: {
              type: 'number'
            }
          }
        }
      }
    },
    tracklists: {
      get: {
        path: '/tracklists',
        schema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number'
            }
          }
        }
      },
      getRandom: {
        path: '/tracklists/random',
        schema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number'
            }
          }
        }
      },
      getStaffPicks: {
        path: '/tracklists/staff-picks',
        schema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number'
            }
          }
        }
      }
    },
    tracks: {
      favorites: {
        toggle: {
          path: '/users/[:uid]/tracks/favorites',
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
              },
              type: {
                type: 'number'
              }
            }
          }
        }
      },
      findOne: {
        path: '/tracks/[:tid]',
        schema: {
          type: 'object',
          properties: {
            tid: {
              type: 'number'
            }
          }
        }
      },
      find: {
        path: '/tracks',
        schema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number'
            }
          }
        }
      }
    }
  }, Object.assign(defaultOptions, options))
}

module.exports = generateApi
