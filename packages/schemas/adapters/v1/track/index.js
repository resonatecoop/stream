module.exports = (track, index) => {
  return {
    count: track.count || 0,
    fav: track.fav || 0,
    url: track.url,
    track: {
      id: track.tid,
      title: track.name,
      duration: track.duration,
      status: track.status === 3 ? 'free' : 'paid',
      cover: track.artwork.large
    },
    track_group: [
      {
        id: track.uid,
        title: track.album,
        display_artist: track.artist,
        tags: track.tags.map((tag) => {
          return {
            name: tag
          }
        })
      }
    ]
  }
}
