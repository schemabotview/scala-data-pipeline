// playstream: what a music service's listeners played
@main def run(): Unit =
  val first = today.head
  val short = today.last
  val status = if first.msPlayed >= 30_000 then "counted" else "skipped"
  println(s"${first.eventId}: $status")
  println(s"${short.eventId}: ${if short.msPlayed >= 30_000 then "counted" else "skipped"}")
  val minutes =
    val m = first.msPlayed / 60_000.0
    f"$m%.1f minutes"
  println(s"${first.eventId}: $minutes")
