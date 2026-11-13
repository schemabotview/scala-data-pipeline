// Ten million plays: first, the way that worked for forty
@main def naive(): Unit =
  val lines = readLines(bigFile).get
  val (bad, good) = parseAll(lines.drop(1))
  println(s"${good.length} plays, ${bad.length} rejected")
