import type { Stripe } from '@stripe/stripe-js'
import type { IState } from 'choo'
import Component from 'choo/component'
import type { Track } from './stores/tracks.types'

// The following two types are utility types that remove the index keys from a type (e.g. [key: string]: any)
// Source: https://stackoverflow.com/a/51955852/998919
type RemoveIndex<T> = {
  [ K in keyof T as string extends K ? never : number extends K ? never : K ]: T[K]
}
type KnownKeys<T> = keyof RemoveIndex<T>

// Utility type for defining that you want a class, rather than an instance of a class
type Class<T> = new (...args: any[]) => T

export interface AppState extends Pick<IState, KnownKeys<IState>> {
  // The following always exist, they are simply mising from the types that Choo ship with
  cache: (component: Class<Component<any>>, id: string, ...args: any[]) => Component<any>
  components: object

  // The following always exist since they are set when the app is first loaded
  title: string
  credits: number
  resolved: boolean
  api: any
  library: {
    items: any[]
  }
  user: {
    avatar?: {
      small?: any
    }
    id?: number
    uid?: number
    legacyId?: number
    role?: string
    nickname?: string
    credits?: string
    token?: string
    clientId?: string
    ownedGroups: Array<{
      displayName: string
    }>
  }
  tracks: any[]
  albums: any[]
  notification: {
    permission: boolean
  }
  messages: any[]

  // The following are set after app initialization by various components
  latestTracks?: {
    count: number
    items: any[]
    pages?: number
  }
  meta?: {
    title: string
    'og:image': string | undefined
    'og:title': string
    'og:type': string
    'og:url': string
    'og:description': string
    'twitter:card': string
    'twitter:title': string
    'twitter:image': any
    'twitter:site': string
    'twitter:player:width': string
    'twitter:player:height': string
    'twitter:player': string
  }
  prefetch?: Array<Promise<any>>
  shortTitle?: string
  stripe?: Stripe | null
  track?: {
    data: {
      count?: number
      favorite?: boolean
      track: Partial<Track>
      track_group?: Array<{
        display_artist: object
        title: object
      }>
      url?: string
    }
  }
}
