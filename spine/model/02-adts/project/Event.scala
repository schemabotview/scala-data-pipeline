// What a listener did: each kind of event, with its own fields
enum Event:
  case Played(play: Play)
  case Skipped(userId: String, trackId: String, startedAt: String, afterMs: Long)
  case Liked(userId: String, trackId: String)
