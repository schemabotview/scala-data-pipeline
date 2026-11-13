// What a listener did: each kind of event, with its own fields
enum Event:
  case Played(play: Play)
  case Skipped(userId: UserId, trackId: TrackId, startedAt: String, afterMs: Long)
  case Liked(userId: UserId, trackId: TrackId)
  case Shared(userId: UserId, trackId: TrackId, to: UserId)
