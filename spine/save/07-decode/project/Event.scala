// What a listener did: each kind of event, with its own fields
enum Event:
  case Played(play: Play)
  case Skipped(userId: UserId, trackId: TrackId, startedAt: String, afterMs: Long)
      extends Event, Timed
  case Liked(userId: UserId, trackId: TrackId)
  case Shared(userId: UserId, trackId: TrackId, to: UserId)

  def describe: String = this match
    case Played(play) => s"${play.userId} played ${catalog(play.trackId)}"
    case Skipped(user, track, _, after) => s"$user skipped ${catalog(track)} after ${after / 1000} s"
    case Liked(user, track) => s"$user liked ${catalog(track)}"
    case Shared(user, track, to) => s"$user shared ${catalog(track)} with $to"
