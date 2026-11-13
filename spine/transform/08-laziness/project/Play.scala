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
      msPlayed: Long, device: Option[Device]): Either[ParseError, Play] =
    if msPlayed < 0 then Left(ParseError.NegativeDuration(msPlayed))
    else Right(new Play(eventId, userId, trackId, startedAt, msPlayed, device))
