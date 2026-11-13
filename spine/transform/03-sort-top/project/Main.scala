// playstream: what a music service's listeners played
@main def run(): Unit =
  val (bad, good) = parseAll(webExport)
  val counted = good.filter(_.isCounted)
  println("Top tracks, 1 October")
  for (row, i) <- topTracks(counted, 5).zipWithIndex do
    println(f"${i + 1}%2d. ${row.title}%-16s ${row.plays}%2d")
