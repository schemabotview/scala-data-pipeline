// Two clocks: when a play happened, and when we heard about it
import java.nio.file.Path
import java.time.{Duration, Instant}

case class Arrival(play: Play, uploadedAt: String)

def arrival(line: String): Either[ParseError, Arrival] =
  for
    event <- decode(line)
    json <- JsonParser.parse(line).left.map(ParseError.BadUpload(_))
    uploaded <- json.text("uploaded_at")
    play <- event match
      case Event.Played(play) => Right(play)
      case _ => Left(ParseError.BadUpload("not a play"))
  yield Arrival(play, uploaded)

extension (a: Arrival)
  def lateBy: Duration = Duration.between(Instant.parse(a.play.startedAt), Instant.parse(a.uploadedAt))

def arrivals(file: Path): List[Arrival] =
  readLines(file).get.flatMap(arrival(_).toOption)

@main def lateness(): Unit =
  for file <- List("b1", "b2", "b3", "b4").map(b => Path.of(s"data/stream/$b.jsonl")); a <- arrivals(file) do
    val late = a.lateBy
    val played = a.play.startedAt.slice(5, 16).replace('T', ' ')
    println(f"${a.play.eventId} played $played, heard ${a.uploadedAt.slice(5, 16).replace('T', ' ')}: ${late.toHours}%2dh${late.toMinutesPart}%02dm late")
