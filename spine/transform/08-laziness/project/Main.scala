// playstream: what a music service's listeners played
@main def run(): Unit =
  val lines = webExport.linesIterator.drop(1)
  val parsed = lines.map { line =>
    println(s"  parsing ${line.take(5)}")
    parse(line)
  }
  println("nothing parsed yet")
  val firstTwo = parsed.take(2).toList
  println(s"took ${firstTwo.length}: ${firstTwo.map(_.map(_.eventId))}")
  val long = webExport.linesIterator.drop(1).map(parse).collect { case Right(p) => p }
    .filter(_.msPlayed >= 240_000).take(1).toList
  println(s"first 4-minute play: ${long.map(_.eventId)}")
