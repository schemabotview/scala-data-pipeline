// playstream: what a music service's listeners played
@main def run(): Unit =
  val line = "e0001,u01,t03,2026-10-01T07:12:05Z,214000,phone"
  val f = line.split(',')
  val play = Play(f(0), f(1), f(2), f(3), f(4).toLong, f(5))
  println(play)
  println(play.trackId)
  println(play.copy(msPlayed = 30_000))
  println(play == Play("e0001", "u01", "t03", "2026-10-01T07:12:05Z", 214_000, "phone"))
