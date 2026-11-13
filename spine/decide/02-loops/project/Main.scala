// playstream: what a music service's listeners played
@main def run(): Unit =
  var total = 0L
  for play <- today do
    total += play.msPlayed
  println(f"listened today: ${total / 60_000.0}%.1f minutes")
  for play <- today if play.msPlayed >= 30_000 do
    println(s"counted: ${play.eventId} (${play.trackId})")
