// playstream: what a music service's listeners played
@main def run(): Unit =
  val trackId = "t03"
  val msPlayed: Long = 214_000
  var plays = 0
  plays = plays + 1
  plays = plays + 1
  val listeners = 12_000
  println("playstream: " + trackId)
  println("plays today: " + plays)
  println("minutes played: " + msPlayed * plays / 60_000.0)
  println("ms played by every listener: " + listeners * msPlayed)
