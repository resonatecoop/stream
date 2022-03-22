import { APIResponse, ClientGetter, Cover, CoverMetadata, PagedRequest, PagedResponse } from './types'

export interface Track {
  id: number
  creator_id: number
  title: string
  duration: number
  album: string | null
  year?: number | null
  artist: string
  cover: string
  cover_metadata: CoverMetadata
  status: string
  url: string
  images: {
    small: Cover
    medium: Cover
    large: Cover
  }
}

export interface TrackResponse {
  data: Track
}

export interface TracksResponse extends PagedResponse<Track> {}

export interface LatestTracksResponse extends Omit<PagedResponse<Track>, 'status'> {}

interface TracksClient {
  getTrack: (params: { id: number }) => Promise<APIResponse<TrackResponse>>
  getTracks: (params: PagedRequest & { order?: string }) => Promise<APIResponse<TracksResponse>>
  getLatestTracks: (params: PagedRequest & { order?: string }) => Promise<APIResponse<LatestTracksResponse>>
}

export async function getTracksClient (clientGetter: ClientGetter): Promise<TracksClient> {
  return clientGetter('tracks')
}
