// From plays to answers: the transformations the pipeline is made of
import java.time.{Duration, Instant, LocalDate, ZoneId}

def playsPerTrack(plays: List[Play]): Map[TrackId, Int] =
  plays.groupMapReduce(_.trackId)(_ => 1)(_ + _)

def topTracks(plays: List[Play], n: Int): List[(title: String, plays: Int)] =
  playsPerTrack(plays).toList
    .sortBy((track, count) => (-count, catalog(track)))
    .take(n)
    .map((track, count) => (title = catalog(track), plays = count))

def msPerUser(plays: List[Play]): Map[UserId, Long] =
  plays.foldLeft(Map.empty[UserId, Long])((totals, play) =>
    totals.updated(play.userId, totals.getOrElse(play.userId, 0L) + play.msPlayed)
  )

val newYork = ZoneId.of("America/New_York")

def dayIn(zone: ZoneId)(play: Play): LocalDate =
  Instant.parse(play.startedAt).atZone(zone).toLocalDate

def dedup(plays: List[Play]): List[Play] = plays.distinctBy(_.eventId)

/** A gap of more than 30 minutes between one play's end and the next one's start ends a session. */
def sessions(plays: List[Play]): List[List[Play]] =
  val endOf = (play: Play) => Instant.parse(play.startedAt).plusMillis(play.msPlayed)
  plays.sortBy(_.startedAt).foldLeft(List.empty[List[Play]])((done, play) =>
    done match
      case (current @ last :: _) :: earlier
          if Duration.between(endOf(last), Instant.parse(play.startedAt)).toMinutes <= 30 =>
        (play :: current) :: earlier
      case _ => List(play) :: done
  ).map(_.reverse).reverse
