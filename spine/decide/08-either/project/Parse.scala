// Turning text into plays, and the rules about them
def parse(line: String): Either[String, Play] =
  val f = line.split(",", -1)
  if f.length != 6 then Left(s"${f.length} fields, not 6")
  else f(4).toLongOption match
    case None => Left(s"not a number: ${f(4)}")
    case Some(ms) => Right(Play(f(0), f(1), f(2), f(3), ms, Some(f(5)).filter(_.nonEmpty)))

def deviceLabel(device: Option[String]): String = device match
  case Some("phone") | Some("car") => "mobile"
  case Some("web") => "browser"
  case Some(other) => s"other ($other)"
  case None => "unknown"

def isCounted(play: Play): Boolean = play.msPlayed >= 30_000
