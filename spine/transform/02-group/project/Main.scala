// playstream: what a music service's listeners played
@main def run(): Unit =
  val (bad, good) = parseAll(webExport)
  val counted = good.filter(_.isCounted)
  val byTrack = counted.groupBy(_.trackId)
  println(s"Slow Tide's plays: ${byTrack(TrackId("t03")).map(_.eventId)}")
  println(s"plays per track: ${playsPerTrack(counted)}")
