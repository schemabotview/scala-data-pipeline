// playstream: what a music service's listeners played
@main def run(): Unit =
  val plays = List(
    Play("e0001", "u01", "t03", "2026-10-01T07:12:05Z", 214_000, Some("phone")),
    Play("e0002", "u02", "t01", "2026-10-01T07:30:41Z", 198_000, None),
    Play("e0003", "u01", "t04", "2026-10-01T07:16:02Z", 61_000, Some("phone")),
    Play("e0004", "u03", "t03", "2026-10-01T08:02:19Z", 214_000, Some("web")),
    Play("e0005", "u02", "t02", "2026-10-01T08:45:00Z", 176_000, Some("car"))
  )
  println(s"plays today: ${plays.length}")
  println(s"first: ${plays.head.eventId}, last: ${plays.last.eventId}")
  println(s"the third: ${plays(2)}")
  val byIndex = plays.toVector
  println(s"the fifth, from a Vector: ${byIndex(4).trackId}")
