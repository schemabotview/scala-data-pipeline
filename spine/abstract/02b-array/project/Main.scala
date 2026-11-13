// playstream: what a music service's listeners played
import java.nio.file.Path

@main def run(): Unit =
  val plays: Array[Play] = readPlays(Path.of("data/plays")).toArray
  val first = earliest(plays)
  println(s"earliest play: ${first.startedAt}")
  val skips = List(Event.Skipped(UserId("u02"), TrackId("t04"), "2026-10-01T06:58:00Z", 9_000))
  println(s"earliest of both: ${earliest(plays ++ skips.toArray[Timed]).startedAt}")
