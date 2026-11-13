// playstream: what a music service's listeners played
import java.nio.file.Path
import java.time.ZoneId

@main def playstream(args: String*): Unit =
  val config = Config.load(args)
  args.filterNot(_.startsWith("--")).toList match
    case List("chart") => chart(config)
    case List("stream") => tick()
    case _ => println("usage: playstream chart | stream  [--top=N] [--zone=Z] [--data=DIR] [--out=DIR]")

/** The daily charts, one partition per day in the configured zone. */
def chart(config: Config): Unit =
  val counted = readPlays(Path.of(config.dataDir)).filter(_.isCounted)
  for (day, plays) <- counted.groupBy(dayIn(ZoneId.of(config.zone))).toList.sortBy(_._1.toString) do
    val perTrack = combineAll(plays.map(play => Map(play.trackId -> 1)))
    val rows = topN(perTrack, config.top).zipWithIndex.map { case ((track, n), i) =>
      ChartRow(i + 1, catalog(track), artistOf(track), n)
    }
    write(Path.of(s"${config.outDir}/date=$day/chart.csv"), toCsv(rows))
    info(s"$day: ${plays.length} plays, top ${rows.length} written")
