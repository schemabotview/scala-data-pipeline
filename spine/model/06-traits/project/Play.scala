// One play: who listened to which track, when, and for how long
case class Play private (
  eventId: String,
  userId: UserId,
  trackId: TrackId,
  startedAt: String,
  msPlayed: Long,
  device: Option[Device]
) extends Timed

object Play:
  def from(eventId: String, userId: UserId, trackId: TrackId, startedAt: String,
      msPlayed: Long, device: Option[Device]): Either[String, Play] =
    if msPlayed < 0 then Left(s"negative duration: $msPlayed")
    else Right(new Play(eventId, userId, trackId, startedAt, msPlayed, device))
