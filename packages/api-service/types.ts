export type ClientGetter = (name: string) => any

export interface APIResponse<T> {
  body: T
}

export interface PagedRequest {
  limit?: number
  page?: number
}

export interface PagedResponse<T> {
  data: T[]
  count: number
  numberOfPages: number
  status: string
}

export interface CoverMetadata {
  id: string | null
}

export interface Cover {
  height: number
  width: number
  url?: string
}
