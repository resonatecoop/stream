import { APIResponse, ClientGetter } from './types'

export interface Track {
  id: number
  album: object
  artist: object
  cover: string
  title: string
  url: string
}

export interface TrackResponse {
  data: Track
}

interface TracksClient {
  getTrack: (params: { id: number }) => Promise<APIResponse<TrackResponse>>
}

export async function getTracksClient (clientGetter: ClientGetter): Promise<TracksClient> {
  return clientGetter('tracks')
}
