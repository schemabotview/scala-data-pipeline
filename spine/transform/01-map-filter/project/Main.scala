// playstream: what a music service's listeners played
@main def run(): Unit =
  val (bad, good) = parseAll(webExport)
  val counted = good.filter(_.isCounted)
  println(s"${good.length} plays parsed, ${counted.length} counted")
  val minutes = counted.map(_.msPlayed.toMinutes)
  println(f"minutes counted: ${minutes.sum}%.1f")
  val devices = good.flatMap(_.device)
  println(s"devices seen: ${devices.distinct}")
  println(s"plays with no device: ${good.length - devices.length}")
