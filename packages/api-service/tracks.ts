import { APIResponse, ClientGetter, Cover, CoverMetadata, PagedRequest, PagedResponse } from './types'

export interface Track {
  id: number
  creator_id: number
  title: string
  duration: number
  album: string | null
  artist: string
  cover: string
  cover_metadata: CoverMetadata
  images: {
    small: Cover
    medium: Cover
  }
  status: 'Paid'
  url: string
}

export interface SingleTrack extends Track {
  images: {
    small: Cover
    medium: Cover
    large: Cover
  }
  year: number | null
}

export interface TrackResponse {
  data: SingleTrack
}

export interface MultiTrack extends Track {
  year: number | null
}

export interface MultiLatestTrack extends Track {}

export interface TracksResponse extends PagedResponse<MultiTrack> {}

export interface LatestTracksResponse extends Omit<PagedResponse<MultiLatestTrack>, 'status'> {}

interface TracksClient {
  getTrack: (params: { id: number }) => Promise<APIResponse<TrackResponse>>
  getTracks: (params: PagedRequest & { order?: string }) => Promise<APIResponse<TracksResponse>>
  getLatestTracks: (params: PagedRequest & { order?: string }) => Promise<APIResponse<LatestTracksResponse>>
}

export async function getTracksClient (clientGetter: ClientGetter): Promise<TracksClient> {
  return clientGetter('tracks')
}
