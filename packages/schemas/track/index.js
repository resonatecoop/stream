const Ref = {
  type: 'object',
  properties: {
    id: {
      type: 'string'
    }
  }
}

const Track = {
  type: 'object',
  additionalProperties: false,
  required: ['title'],
  properties: {
    id: {
      type: 'string'
    },
    title: {
      type: 'string'
    },
    performers: {
      type: 'array',
      items: Ref
    },
    labels: {
      type: 'array',
      items: Ref
    },
    rights: {
      type: 'array',
      items: Ref
    },
    published_date: {
      type: 'string'
    },
    status: {
      type: 'string',
      enum: ['free', 'paid'],
      default: 'paid'
    },
    duration: {
      type: 'number',
      minimum: 0
    },
    links: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          platform: {
            type: 'string',
            enum: ['instagram', 'twitter', 'facebook', 'github']
          },
          uri: {
            type: 'string'
          }
        }
      }
    },
    cover: {
      type: 'string'
    },
    audiofile: Ref
  }
}

const Tag = {
  type: 'object',
  additionalProperties: false,
  required: ['name'],
  properties: {
    genre: {
      type: 'string'
    },
    name: {
      type: 'string'
    }
  }
}

const TrackGroup = {
  type: 'object',
  additionalProperties: false,
  required: ['title'],
  properties: {
    id: {
      type: 'string'
    },
    title: {
      type: 'string'
    },
    display_artist: {
      type: 'string'
    },
    type: {
      type: 'string',
      enum: ['lp', 'playlist']
    },
    cover: {
      type: 'string'
    },
    about: {
      type: 'string'
    },
    private: {
      type: 'boolean',
      default: false
    },
    multiple_composers: {
      type: 'boolean',
      default: false
    },
    tracks: {
      type: 'array',
      items: Ref
    },
    tags: {
      type: 'array',
      items: Tag
    },
    release_date: {
      type: 'string'
    },
    total_tracks: {
      type: 'number'
    }
  }
}

module.exports = {
  Track,
  TrackGroup
}
