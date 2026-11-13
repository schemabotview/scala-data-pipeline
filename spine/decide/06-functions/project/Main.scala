// playstream: what a music service's listeners played
@main def run(): Unit =
  val counted = today.filter(isCounted)
  println(s"counted: ${counted.length} of ${today.length}")
  val long = today.filter(play => play.msPlayed >= 200_000)
  println(s"over 200 s: ${long.map(_.eventId)}")
  val tracks = counted.map(_.trackId)
  println(s"tracks: $tracks")
  val isMobile: Play => Boolean = play => deviceLabel(play.device) == "mobile"
  println(s"on mobile: ${today.count(isMobile)}")
