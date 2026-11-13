// playstream: what a music service's listeners played
@main def run(): Unit =
  val (bad, good) = parseAll(webExport)
  println(s"${good.length} plays, ${bad.length} rejected")
  for (line, error) <- bad do
    println(s"  line $line, $error: ${error.message}")
