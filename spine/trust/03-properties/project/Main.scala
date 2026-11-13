// playstream: what a music service's listeners played
import java.nio.file.Path

@main def run(): Unit =
  val counted = readPlays(Path.of("data/plays")).filter(_.isCounted)
  val perTrack = combineAll(counted.map(play => Map(play.trackId -> 1)))
  val chart = topN(perTrack, 3).zipWithIndex.map { case ((track, plays), i) =>
    ChartRow(i + 1, catalog(track), artistOf(track), plays)
  }
  val (plays, ms) = combineAll(counted.map(p => (Map(p.userId -> 1), Map(p.userId -> p.msPlayed))))
  val listeners = plays.keys.toList.sorted.take(3).map(user =>
    ListenerRow(user.toString, plays(user), ms(user) / 60_000))
  write(Path.of("out/chart.csv"), toCsv(chart))
  write(Path.of("out/listeners.csv"), toCsv(listeners))
