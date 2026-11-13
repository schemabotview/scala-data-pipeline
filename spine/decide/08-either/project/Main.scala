// playstream: what a music service's listeners played
@main def run(): Unit =
  val lines = webExport.linesIterator.drop(1).toList
  for line <- lines do
    parse(line) match
      case Right(play) => println(s"ok: ${play.eventId}, device ${play.device}")
      case Left(problem) => println(s"skipped: $problem")
