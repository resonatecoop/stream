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

export interface TracksFindProps {
  limit?: number
  page?: number
  order?: string
}
