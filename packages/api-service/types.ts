export type ClientGetter = (name: string) => any

export interface APIResponse<T> {
  body: T
}

export interface CoverMetadata {
  id: string
}

export interface Cover {
  height: number
  width: number
  url: string
}
