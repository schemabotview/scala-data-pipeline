// A watermark: how far event time has surely got, so a window can be called final
import java.time.{Duration, Instant}

val allowedLateness = Duration.ofHours(1)

@main def watermarks(): Unit =
  var latest = Instant.EPOCH
  var open = Map.empty[String, Map[TrackId, Int]]
  var closed = Set.empty[String]
  for batch <- batches do
    val plays = arrivals(batch).map(_.play)
    val (late, onTime) = plays.partition(play => closed.contains(windowOf(play)))
    open = open |+| countWindows(onTime)
    latest = (latest :: plays.map(play => Instant.parse(play.startedAt))).max
    val watermark = latest.minus(allowedLateness)
    val (ready, waiting) = open.partition((window, _) => !windowEnd(window).isAfter(watermark))
    println(s"${batch.getFileName}: watermark ${watermark.toString.slice(5, 16).replace('T', ' ')}")
    for (window, counts) <- ready.toList.sortBy(_._1) do println(s"  final ${window.drop(11)}  ${show(counts)}")
    for play <- late do println(s"  late  ${play.eventId}, for ${windowOf(play).drop(11)}")
    open = waiting
    closed = closed ++ ready.keys
