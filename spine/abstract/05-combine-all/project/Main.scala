// playstream: what a music service's listeners played
import java.nio.file.Path

@main def run(): Unit =
  val counted = readPlays(Path.of("data/plays")).filter(_.isCounted)
  val perTrack = combineAll(counted.map(play => Map(play.trackId -> 1)))
  println(s"tracks:  ${topN(perTrack, 3)}")
  val (plays, msPerUser) = combineAll(counted.map(play => (1, Map(play.userId -> play.msPlayed))))
  println(s"$plays plays, ${msPerUser.size} listeners, in one pass")
  println(f"u01: ${msPerUser(UserId("u01")).toMinutes}%.1f minutes")
