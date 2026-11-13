// playstream: what a music service's listeners played
@main def run(): Unit =
  val (bad, good) = parseAll(webExport)
  val counted = good.filter(_.isCounted)
  println(s"${counted.length} of ${good.length} plays counted")
  for play <- counted do
    println(f"  ${play.eventId} on ${play.deviceKind}: ${play.msPlayed.toMinutes}%.1f min")
