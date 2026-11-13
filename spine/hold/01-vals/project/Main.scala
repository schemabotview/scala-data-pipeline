// playstream: what a music service's listeners played
@main def run(): Unit =
  val trackId = "t03"
  val msPlayed = 214_000
  var plays = 0
  plays = plays + 1
  plays = plays + 1
  println("playstream: " + trackId)
  println("plays today: " + plays)
  println("minutes played: " + msPlayed * plays / 60_000.0)
