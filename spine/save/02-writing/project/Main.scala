// playstream: what a music service's listeners played
import java.nio.file.Path

@main def run(): Unit =
  val lines = readLines(Path.of("data/plays/2026-10-01.csv")).get
  val (bad, good) = parseAll(lines.drop(1))
  val counted = dedup(good).filter(_.isCounted)
  val target = Path.of("out/chart.csv")
  write(target, chartCsv(topTracks(counted, 5)))
  println(s"${counted.length} counted plays, chart written to $target")
