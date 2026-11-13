// playstream: what a music service's listeners played
@main def run(): Unit =
  val lines = webExport.linesIterator.drop(1).toList
  for line <- lines do
    try
      val play = parse(line)
      println(s"ok: ${play.eventId}")
    catch
      case e: NumberFormatException => println(s"skipped, ${e.getMessage}")
      case e: ArrayIndexOutOfBoundsException => println(s"skipped, ${e.getMessage}")
