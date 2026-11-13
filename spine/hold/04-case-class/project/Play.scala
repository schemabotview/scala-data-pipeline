// One play: who listened to which track, when, and for how long
case class Play(
  eventId: String,
  userId: String,
  trackId: String,
  startedAt: String,
  msPlayed: Long,
  device: String
)
