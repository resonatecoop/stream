module.exports = (track, index) => {
  return {
    count: track.count || 0,
    fav: track.fav || 0,
    url: track.url,
    track: {
      id: track.tid,
      creator_id: track.uid,
      artist: track.artist,
      title: track.name,
      duration: track.duration,
      status: track.status === 2 ? 'free' : 'paid',
      cover: track.artwork.large
    },
    track_group: [
      {
        title: track.album,
        display_artist: track.artist
      }
    ]
  }
}
