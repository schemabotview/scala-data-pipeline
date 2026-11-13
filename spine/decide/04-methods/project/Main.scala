// playstream: what a music service's listeners played
@main def run(): Unit =
  val late = parse("e0007,u03,t05,2026-10-01T09:14:51Z,98000,web")
  for play <- today :+ late do
    val counted = if isCounted(play) then "counted" else "skipped"
    println(s"${play.eventId} on ${deviceLabel(play.device)}: $counted")
