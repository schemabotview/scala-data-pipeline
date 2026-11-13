// playstream: what a music service's listeners played
@main def run(): Unit =
  val play = Play("e0001", "u01", "t03", "2026-10-01T07:12:05Z", 214_000, Some("phone"))
  val pair = ("t03", 214_000L)
  println(pair)
  println(pair._1)
  val (track, ms) = pair
  println(s"$track: $ms ms")
  val top = (track = play.trackId, plays = 17)
  println(top)
  println(s"${top.track} is number one with ${top.plays} plays")
