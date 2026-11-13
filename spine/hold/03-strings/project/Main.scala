// playstream: what a music service's listeners played
@main def run(): Unit =
  val line = "e0001,u01,t03,2026-10-01T07:12:05Z,214000,phone"
  val fields = line.split(',')
  val msPlayed = fields(4).toLong
  println(s"track ${fields(2)}, played by ${fields(1)} on a ${fields(5)}")
  println(s"started at ${fields(3).take(10)}, ${fields(3).slice(11, 16)} UTC")
  println(f"minutes played: ${msPlayed / 60_000.0}%.2f")
