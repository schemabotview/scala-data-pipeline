// One play: who listened to which track, when, and for how long
case class Play(
  eventId: String,
  userId: UserId,
  trackId: TrackId,
  startedAt: String,
  msPlayed: Long,
  device: Option[Device]
)
