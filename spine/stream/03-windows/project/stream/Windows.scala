// Tumbling windows: every play counted in the hour it happened, by event time
import java.nio.file.Path
import java.time.{Duration, Instant}

def windowOf(play: Play): String = play.startedAt.take(13) + ":00"
def windowEnd(window: String): Instant = Instant.parse(window + ":00Z").plus(Duration.ofHours(1))

def countWindows(plays: List[Play]): Map[String, Map[TrackId, Int]] =
  combineAll(plays.map(play => Map(windowOf(play) -> Map(play.trackId -> 1))))

def show(counts: Map[TrackId, Int]): String =
  counts.toList.sortBy(_._1).map((track, n) => s"$track:$n").mkString(" ")

val batches = List("b1", "b2", "b3", "b4").map(b => Path.of(s"data/stream/$b.jsonl"))

@main def windows(): Unit =
  val plays = batches.take(3).flatMap(arrivals).map(_.play)
  for (window, counts) <- countWindows(plays).toList.sortBy(_._1) do
    println(s"${window.drop(5).replace('T', ' ')}  ${show(counts)}")
