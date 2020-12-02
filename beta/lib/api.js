const apiFactoryGenerator = require('./api-gen')
const moment = require('moment')

/**
 * REST API configuration
 * @param {object} options Options for apiFactoryGenerator
 */
const generateApi = (opts = {}) => {
  const defaultOptions = {
    scheme: 'https://',
    domain: process.env.API_DOMAIN || 'api.resonate.localhost',
    prefix: '/v' + (opts.version || 1),
    auth: true,
    version: 1
  }

  const options = Object.assign(defaultOptions, opts)

  return apiFactoryGenerator({
    1: {
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
      users: {
        favorites: {
          resolve: {
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
                ids: {
                  type: 'array',
                  items: {
                    type: 'number'
                  }
                }
              }
            }
          },
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
                }
              }
            }
          }
        },
        tracks: {
          picks: {
            path: '/users/[:uid]/tracks/favorites',
            schema: {
              type: 'object',
              properties: {
                uid: {
                  type: 'number'
                },
                limit: {
                  type: 'number'
                },
                page: {
                  type: 'number'
                }
              }
            }
          },
          collection: {
            path: '/users/[:uid]/tracks/owned',
            schema: {
              type: 'object',
              properties: {
                uid: {
                  type: 'number'
                },
                limit: {
                  type: 'number'
                },
                page: {
                  type: 'number'
                }
              }
            }
          },
          history: {
            path: '/users/[:uid]/plays',
            schema: {
              type: 'object',
              properties: {
                uid: {
                  type: 'number'
                },
                limit: {
                  type: 'number'
                },
                page: {
                  type: 'number'
                }
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
      },
      labels: {
        query: {
          path: '/labels',
          options: {
            method: 'POST'
          },
          schema: {
            type: 'object',
            properties: {
              ids: {
                type: 'array',
                items: {
                  type: 'number'
                }
              }
            }
          }
        },
        search: {
          path: '/labels',
          schema: {
            type: 'object',
            properties: {
              q: {
                type: 'string'
              }
            }
          }
        },
        find: {
          path: '/labels',
          schema: {
            type: 'object',
            properties: {
              page: {
                type: 'number'
              },
              limit: {
                type: 'number'
              }
            }
          }
        },
        findOne: {
          path: '/labels/[:id]',
          schema: {
            type: 'object',
            properties: {
              uid: {
                type: 'number'
              }
            }
          }
        },
        getLinks: {
          path: '/labels/[:id]/links',
          schema: {
            type: 'object',
            properties: {
              uid: {
                type: 'number'
              }
            }
          }
        },
        getArtists: {
          path: '/labels/[:id]/artists',
          schema: {
            type: 'object',
            properties: {
              uid: {
                type: 'number'
              },
              limit: {
                type: 'number'
              }
            }
          }
        },
        getAlbums: {
          path: '/labels/[:id]/albums',
          schema: {
            type: 'object',
            properties: {
              uid: {
                type: 'number'
              },
              limit: {
                type: 'number'
              }
            }
          }
        }
      },
      artists: {
        find: {
          path: '/artists',
          schema: {
            type: 'object',
            properties: {
              page: {
                type: 'number'
              },
              limit: {
                type: 'number'
              },
              order: {
                type: 'string',
                enum: ['desc', 'asc']
              },
              order_by: {
                type: 'string',
                enum: ['name', 'id']
              }
            }
          }
        },
        query: {
          path: '/artists',
          options: {
            method: 'POST'
          },
          schema: {
            type: 'object',
            properties: {
              ids: {
                type: 'array',
                items: {
                  type: 'number'
                }
              }
            }
          }
        },
        search: {
          path: '/artists',
          schema: {
            type: 'object',
            properties: {
              q: {
                type: 'string'
              }
            }
          }
        },
        findOne: {
          path: '/artists/[:uid]',
          schema: {
            type: 'object',
            properties: {
              uid: {
                type: 'number'
              }
            }
          }
        },
        getLinks: {
          path: '/artists/[:uid]/links',
          schema: {
            type: 'object',
            properties: {
              uid: {
                type: 'number'
              }
            }
          }
        },
        getLabel: {
          path: '/artists/[:uid]/label',
          schema: {
            type: 'object',
            properties: {
              uid: {
                type: 'number'
              }
            }
          }
        },
        getAlbums: {
          path: '/artists/[:uid]/albums',
          schema: {
            type: 'object',
            properties: {
              uid: {
                type: 'number'
              },
              limit: {
                type: 'number'
              },
              page: {
                type: 'number'
              }
            }
          }
        },
        getNewTracks: {
          path: '/artists/[:uid]/tracks/new',
          schema: {
            type: 'object',
            properties: {
              uid: {
                type: 'number'
              },
              limit: {
                type: 'number'
              }
            }
          }
        },
        getLatestRelease: {
          path: '/artists/[:uid]/albums/latest',
          schema: {
            type: 'object',
            properties: {
              uid: {
                type: 'number'
              },
              limit: {
                type: 'number'
              }
            }
          }
        },
        getTopTracks: {
          path: '/artists/[:uid]/tracks/top',
          schema: {
            type: 'object',
            properties: {
              uid: {
                type: 'number'
              },
              limit: {
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
              },
              limit: {
                type: 'number'
              },
              page: {
                type: 'number'
              }
            }
          }
        }
      },
      tracklists: {
        get: {
          path: '/tracklists/[:type]',
          schema: {
            type: 'object',
            properties: {
              type: {
                type: 'string'
              },
              limit: {
                type: 'number'
              },
              page: {
                type: 'number'
              }
            }
          }
        }
      },
      tracks: {
        search: {
          path: '/tracks',
          schema: {
            type: 'object',
            properties: {
              q: {
                type: 'string'
              }
            }
          }
        },
        findOne: {
          path: '/tracks/[:id]',
          schema: {
            type: 'object',
            properties: {
              id: {
                type: 'number'
              }
            }
          }
        },
        get: {
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
    },
    2: {
      labels: {
        findOne: {
          path: '/labels/[:id]',
          schema: {
            type: 'object',
            properties: {
              id: {
                type: 'number'
              }
            }
          }
        }
      },
      artists: {
        findOne: {
          path: '/artists/[:id]',
          schema: {
            type: 'object',
            properties: {
              id: {
                type: 'number'
              }
            }
          }
        },
        find: {
          path: '/artists',
          schema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number'
              },
              page: {
                type: 'number'
              }
            }
          }
        }
      },
      resolve: {
        path: '/resolve',
        schema: {
          type: 'object',
          properties: {
            url: {
              type: 'string'
            }
          }
        }
      },
      user: {
        trackgroups: {
          find: {
            path: '/user/trackgroups',
            schema: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['playlist', 'ep', 'lp', 'single'],
                  default: 'playlist'
                },
                limit: {
                  type: 'number'
                },
                page: {
                  type: 'number'
                }
              }
            }
          }
        }
      },
      releases: {
        find: {
          path: '/releases',
          schema: {
            type: 'object',
            properties: {
              featured: {
                type: 'boolean'
              },
              limit: {
                type: 'number'
              },
              page: {
                type: 'number'
              }
            }
          }
        },
        findOne: {
          path: '/releases/[:id]',
          schema: {
            type: 'object',
            required: ['id'],
            properties: {
              id: {
                type: 'string',
                format: 'uuid'
              }
            }
          }
        }
      },
      plays: {
        test: {
          path: '/user/plays/spendings',
          schema: {
            type: 'object',
            properties: {
              period: {
                type: 'string',
                enum: ['yearly', 'daily', 'monthly']
              },
              from: {
                format: 'date',
                formatMaximum: moment().format('YYYY-MM-DD'),
                formatExclusiveMaximum: false
              },
              to: {
                format: 'date',
                formatMaximum: moment().format('YYYY-MM-DD'),
                formatExclusiveMaximum: false
              }
            }
          }
        },
        stats: {
          path: '/user/plays/stats',
          schema: {
            type: 'object',
            properties: {
              period: {
                type: 'string',
                enum: ['yearly', 'daily', 'monthly']
              },
              from: {
                format: 'date',
                formatMaximum: moment().format('YYYY-MM-DD'),
                formatExclusiveMaximum: false
              },
              to: {
                format: 'date',
                formatMaximum: moment().format('YYYY-MM-DD'),
                formatExclusiveMaximum: false
              }
            }
          }
        },
        history: {
          artists: {
            path: '/user/plays/history/artists',
            schema: {
              type: 'object',
              properties: {
                limit: {
                  type: 'number'
                },
                page: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
    }
  }[options.version], options)
}

module.exports = generateApi
