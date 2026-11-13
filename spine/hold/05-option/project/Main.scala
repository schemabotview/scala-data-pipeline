// playstream: what a music service's listeners played
@main def run(): Unit =
  val line = "e0001,u01,t03,2026-10-01T07:12:05Z,214000,phone"
  val f = line.split(',')
  val play = Play(f(0), f(1), f(2), f(3), f(4).toLong, Some(f(5)))
  val old = Play("e0002", "u02", "t01", "2026-10-01T07:30:41Z", 198_000, None)
  println(play)
  println(old)
  println(play.device.getOrElse("unknown device"))
  println(old.device.getOrElse("unknown device"))
