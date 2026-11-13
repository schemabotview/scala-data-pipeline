// playstream: what a music service's listeners played
@main def run(): Unit =
  val catalog = Map(
    "t01" -> "Northern Lights",
    "t02" -> "Paper Boats",
    "t03" -> "Slow Tide",
    "t04" -> "Glasshouse"
  )
  val plays = List(
    Play("e0001", "u01", "t03", "2026-10-01T07:12:05Z", 214_000, Some("phone")),
    Play("e0002", "u02", "t01", "2026-10-01T07:30:41Z", 198_000, None),
    Play("e0003", "u01", "t04", "2026-10-01T07:16:02Z", 61_000, Some("phone")),
    Play("e0004", "u03", "t03", "2026-10-01T08:02:19Z", 214_000, Some("web")),
    Play("e0005", "u02", "t02", "2026-10-01T08:45:00Z", 176_000, Some("car"))
  )
  println(s"plays today: ${plays.length}")
  println(s"t03 is ${catalog("t03")}")
  println(s"t09 is ${catalog.get("t09")}")
  val listeners = Set(plays(0).userId, plays(1).userId, plays(2).userId, plays(3).userId, plays(4).userId)
  println(s"listeners: $listeners, ${listeners.size} of them")
  println(s"did u04 listen? ${listeners.contains("u04")}")
