// The stream as a fold: (state, batch) => (new state, what to write)
import java.time.Instant

case class StreamState(latest: Instant, open: Map[String, Map[TrackId, Int]], closed: Set[String], seen: Set[String])

object StreamState:
  val empty = StreamState(Instant.EPOCH, Map.empty, Set.empty, Set.empty)

case class Output(finals: Map[String, Map[TrackId, Int]], late: List[Play], repeats: Int)

def step(state: StreamState, plays: List[Play]): (StreamState, Output) =
  val fresh = plays.filterNot(play => state.seen.contains(play.eventId))  // counted once, ever
  val (late, onTime) = fresh.partition(play => state.closed.contains(windowOf(play)))
  val latest = (state.latest :: fresh.map(play => Instant.parse(play.startedAt))).max
  val open = state.open |+| countWindows(onTime)
  val watermark = latest.minus(allowedLateness)
  val (ready, waiting) = open.partition((window, _) => !windowEnd(window).isAfter(watermark))
  val seen = state.seen ++ fresh.map(_.eventId)
  (StreamState(latest, waiting, state.closed ++ ready.keys, seen), Output(ready, late, plays.length - fresh.length))

@main def fold(): Unit =
  val end = batches.foldLeft(StreamState.empty) { (state, batch) =>
    val (next, out) = step(state, arrivals(batch).map(_.play))
    println(s"${batch.getFileName}: ${out.finals.size} final, ${out.late.length} late")
    next
  }
  println(s"still open: ${end.open.keys.toList.sorted.map(_.drop(5).replace('T', ' '))}")
