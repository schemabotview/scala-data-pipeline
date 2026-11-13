// playstream: what a music service's listeners played
@main def run(): Unit =
  val lines = webExport.linesIterator.drop(1).toList
  val (bad, good) = lines.zipWithIndex.partitionMap((line, i) =>
    parse(line).left.map(problem => s"line ${i + 2}: $problem")
  )
  println(s"${good.length} plays, ${bad.length} rejected")
  for play <- good do
    println(s"  ${play.eventId} ${catalog(play.trackId)}")
  for problem <- bad do
    println(s"  rejected, $problem")
