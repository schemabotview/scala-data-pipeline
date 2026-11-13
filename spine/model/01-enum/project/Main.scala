// playstream: what a music service's listeners played
@main def run(): Unit =
  val (bad, good) = parseAll(webExport)
  println(s"${good.length} plays, ${bad.length} rejected")
  for play <- good do
    println(s"  ${play.eventId} ${catalog(play.trackId)} on ${deviceLabel(play.device)}")
