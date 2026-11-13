// playstream: what a music service's listeners played
@main def run(): Unit =
  val plays = List(
    Play("e0001", "u01", "t03", "2026-10-01T07:12:05Z", 214_000, Some("phone")),
    Play("e0002", "u02", "t01", "2026-10-01T07:30:41Z", 198_000, None),
    Play("e0003", "u01", "t04", "2026-10-01T07:16:02Z", 61_000, Some("phone")),
    Play("e0004", "u03", "t03", "2026-10-01T08:02:19Z", 214_000, Some("web")),
    Play("e0005", "u02", "t02", "2026-10-01T08:45:00Z", 176_000, Some("car"))
  )
  val late = Play("e0006", "u04", "t02", "2026-10-01T09:01:33Z", 176_000, Some("web"))
  val withLate = late :: plays
  println(s"plays: ${plays.length}, withLate: ${withLate.length}")
  println(s"plays still starts at ${plays.head.eventId}")
  println(s"withLate shares plays as its tail: ${withLate.tail eq plays}")
  val fixed = plays.head.copy(msPlayed = 200_000)
  println(s"${plays.head.msPlayed} is untouched; the copy has ${fixed.msPlayed}")
