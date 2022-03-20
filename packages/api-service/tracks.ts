import APIService from './index'

export interface Track {
  id: number
  album: object
  artist: object
  cover: string
  title: string
  url: string
}

export interface TrackAPIResponse {
  body: {
    data: Track
  }
}

interface TracksClient {
  getTrack: (params: { id: number }) => TrackAPIResponse
}

export async function getTracksClient (apiHost: string): Promise<TracksClient> {
  const { getAPIServiceClient } = APIService({ apiHost: apiHost })
  return getAPIServiceClient('tracks')
}
