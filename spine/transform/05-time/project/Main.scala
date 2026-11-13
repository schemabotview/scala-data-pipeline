// playstream: what a music service's listeners played
import java.time.ZoneOffset

@main def run(): Unit =
  val (bad, good) = parseAll(webExport)
  val counted = good.filter(_.isCounted)
  val utc = counted.groupBy(dayIn(ZoneOffset.UTC)).view.mapValues(_.length).toMap
  val ny = counted.groupBy(dayIn(newYork)).view.mapValues(_.length).toMap
  println(s"days in UTC:      $utc")
  println(s"days in New York: $ny")
  val late = counted.filter(play => dayIn(ZoneOffset.UTC)(play) != dayIn(newYork)(play))
  println(s"plays on a different day: ${late.map(_.eventId)}")
