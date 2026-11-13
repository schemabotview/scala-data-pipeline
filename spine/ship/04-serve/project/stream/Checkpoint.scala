// The stream's place, saved: which files are done, and the state after them
import java.nio.file.{Files, Path}
import java.time.Instant
import scala.jdk.CollectionConverters.*

val checkpointFile = Path.of("checkpoint/state.json")

def checkpointJson(state: StreamState, done: List[String]): Json = Json.Obj(List(
  "done" -> Json.Arr(done.map(Json.Str(_))),
  "latest" -> Json.Str(state.latest.toString),
  "closed" -> Json.Arr(state.closed.toList.sorted.map(Json.Str(_))),
  "seen" -> Json.Arr(state.seen.toList.sorted.map(Json.Str(_))),
  "open" -> Json.Obj(state.open.toList.sortBy(_._1).map((window, counts) =>
    window -> Json.Obj(counts.toList.sortBy(_._1).map((track, n) => track.toString -> Json.Num(n)))))
))

def strings(json: Json, name: String): List[String] = json.field(name) match
  case Some(Json.Arr(items)) => items.collect { case Json.Str(s) => s }
  case _ => Nil

def counts(json: Json): Map[TrackId, Int] = json match
  case Json.Obj(tracks) => tracks.collect { case (track, Json.Num(n)) => TrackId(track) -> n.toInt }.toMap
  case _ => Map.empty

def loadCheckpoint(): (StreamState, List[String]) =
  JsonParser.parse(if Files.exists(checkpointFile) then Files.readString(checkpointFile) else "{}") match
    case Left(_) => (StreamState.empty, Nil)
    case Right(json) =>
      val open = json.field("open") match
        case Some(Json.Obj(windows)) => windows.map((window, tracks) => window -> counts(tracks)).toMap
        case _ => Map.empty
      val latest = json.text("latest").map(Instant.parse).getOrElse(Instant.EPOCH)
      (StreamState(latest, open, strings(json, "closed").toSet, strings(json, "seen").toSet), strings(json, "done"))

@main def tick(): Unit =
  val (state, done) = loadCheckpoint()
  val fresh = Files.list(inbox).iterator.asScala.map(_.getFileName.toString).toList.sorted.filterNot(done.contains)
  val (next, finished) = fresh.foldLeft((state, done)) { case ((before, files), file) =>
    val (after, out) = step(before, arrivals(inbox.resolve(file)).map(_.play))
    for (window, counts) <- out.finals do
      write(Path.of(s"out/windows/${window.take(13)}.csv"), counts.toList.sortBy(_._1).map((t, n) => s"$t,$n\n").mkString)
    if out.late.nonEmpty then  // one file per batch, replaced whole: a replay rewrites it, never adds to it
      write(Path.of(s"out/late/${file.stripSuffix(".jsonl")}.csv"), out.late.map(_.eventId + "\n").mkString)
    info(s"$file: ${out.finals.size} final, ${out.late.length} late, ${out.repeats} already counted")
    (after, files :+ file)
  }
  if sys.env.contains("CRASH") then
    warn("crashing before the checkpoint is saved")
    Runtime.getRuntime.halt(137)
  write(checkpointFile, checkpointJson(next, finished).render + "\n")
  info(s"checkpoint saved: ${finished.length} files done")
