// playstream: what a music service's listeners played
import java.nio.file.{Files, Path}
import scala.jdk.CollectionConverters.*

@main def run(): Unit =
  val files = Files.list(Path.of("data/plays")).iterator.asScala.toList.sorted
  val lines = files.flatMap(file => readLines(file).get.drop(1))
  val (bad, good) = parseAll(lines)
  val counted = dedup(good).filter(_.isCounted)
  for (day, plays) <- counted.groupBy(dayIn(newYork)).toList.sortBy(_._1) do
    val target = Path.of(s"out/date=$day/chart.csv")
    write(target, chartCsv(topTracks(plays, 5)))
    println(s"$day: ${plays.length} plays → $target")
