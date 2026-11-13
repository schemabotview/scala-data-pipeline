// Turning text into plays, and the rules about them
def parse(line: String): Either[String, Play] =
  val f = line.split(",", -1)
  for
    _ <- Either.cond(f.length == 6, (), s"${f.length} fields, not 6")
    ms <- f(4).toLongOption.toRight(s"not a number: ${f(4)}")
    track <- Either.cond(catalog.contains(f(2)), f(2), s"unknown track: ${f(2)}")
  yield Play(f(0), f(1), track, f(3), ms, Some(f(5)).filter(_.nonEmpty))

def deviceLabel(device: Option[String]): String = device match
  case Some("phone") | Some("car") => "mobile"
  case Some("web") => "browser"
  case Some(other) => s"other ($other)"
  case None => "unknown"

def isCounted(play: Play): Boolean = play.msPlayed >= 30_000
