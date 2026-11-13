// Ten million plays in constant memory: one line at a time, one running total
import java.nio.file.Path
import scala.io.Source
import scala.util.Using

def countTracks(file: Path, header: Boolean): Map[TrackId, Int] =
  Using.resource(Source.fromFile(file.toFile)) { source =>
    source.getLines().drop(if header then 1 else 0)
      .map(parse)
      .collect { case Right(play) if play.isCounted => Map(play.trackId -> 1) }
      .foldLeft(Map.empty[TrackId, Int])(_ |+| _)
  }

@main def streaming(): Unit =
  val counts = countTracks(bigFile, header = true)
  println(s"top tracks: ${topN(counts, 3)}")
  val runtime = Runtime.getRuntime
  println(s"heap in use at the end: ${(runtime.totalMemory - runtime.freeMemory) / 1_000_000} MB")
