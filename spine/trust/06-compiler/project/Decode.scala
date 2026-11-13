// From a phone's JSON line to one of our events
extension (json: Json)
  def field(name: String): Option[Json] = json match
    case Json.Obj(fields) => fields.collectFirst { case (`name`, value) => value }
    case _ => None

  def text(name: String): Either[ParseError, String] = field(name) match
    case Some(Json.Str(s)) => Right(s)
    case _ => Left(ParseError.BadUpload(s"no text field $name"))

  def number(name: String): Either[ParseError, Long] = field(name) match
    case Some(Json.Num(n)) => Right(n.toLong)
    case _ => Left(ParseError.BadUpload(s"no number field $name"))

def decode(line: String): Either[ParseError, Event] =
  for
    json <- JsonParser.parse(line).left.map(ParseError.BadUpload(_))
    kind <- json.text("type")
    user <- json.text("user_id").map(UserId(_))
    track <- json.text("track_id").map(TrackId(_))
    event <- kind match
      case "play" =>
        for
          id <- json.text("event_id")
          at <- json.text("started_at")
          ms <- json.number("ms_played")
          device = json.text("device").toOption.flatMap(d => Device.values.find(_.toString.equalsIgnoreCase(d)))
          play <- Play.from(id, user, track, at, ms, device)
        yield Event.Played(play)
      case "skip" => json.number("after_ms").flatMap(after => json.text("started_at").map(Event.Skipped(user, track, _, after)))
      case "like" => Right(Event.Liked(user, track))
      case other => Left(ParseError.BadUpload(s"unknown event type $other"))
  yield event
