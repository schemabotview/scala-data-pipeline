// playstream: what a music service's listeners played
@main def run(): Unit =
  val (bad, good) = parseAll(webExport)
  val repeated = good.groupBy(_.eventId).collect { case (id, copies) if copies.length > 1 => id }
  println(s"event ids seen twice: $repeated")
  val plays = dedup(good)
  println(s"${good.length} parsed, ${plays.length} after dedup")
  println("Top tracks, 1 October, deduplicated")
  for (row, i) <- topTracks(plays.filter(_.isCounted), 3).zipWithIndex do
    println(f"${i + 1}%2d. ${row.title}%-16s ${row.plays}%2d")
