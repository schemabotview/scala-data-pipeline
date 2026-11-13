// playstream: what a music service's listeners played
import java.nio.file.Path

@main def run(): Unit =
  val counted = readPlays(Path.of("data/plays")).filter(_.isCounted)
  val perTrack = combineAll(counted.map(play => Map(play.trackId -> 1)))
  val chart = topN(perTrack, 3).zipWithIndex.map { case ((track, plays), i) =>
    ChartRow(i + 1, catalog(track), artistOf(track), plays)
  }
  write(Path.of("out/chart.csv"), toCsv(chart))
  info(s"wrote out/chart.csv: ${chart.length} rows")
