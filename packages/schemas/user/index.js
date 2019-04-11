const Email = {
  type: 'string',
  minLength: 5,
  maxLength: 256
}

const Username = {
  type: 'string',
  minLength: 1,
  maxLength: 48,
  pattern: '^[a-z][a-z0-9_-]*$'
}

const UserGroups = {
  type: 'object',
  additionalProperties: false,
  properties: {
    artists: {
      type: 'array'
    },
    labels: {
      type: 'array'
    }
  }
}

const User = {
  type: 'object',
  additionalProperties: false,
  required: ['email', 'full_name', 'display_name', 'username'],
  properties: {
    id: {
      type: 'string'
    },
    created_at: {
      type: 'string'
    },
    updated_at: {
      type: 'string'
    },
    full_name: {
      type: 'string'
    },
    display_name: {
      type: 'string'
    },
    first_name: {
      type: 'string'
    },
    last_name: {
      type: 'string'
    },
    residence_address: {
      type: 'object'
    },
    email: Email,
    username: Username,
    member: {
      type: 'boolean',
      default: false
    },
    tags: {
      type: 'array'
    },
    userGroups: UserGroups,
    avatar: {
      type: 'string'
    }
  }
}

module.exports = {
  User,
  UserGroups,
  Username,
  Email
}
