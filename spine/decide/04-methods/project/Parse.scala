// Turning text into plays, and the rules about them
def parse(line: String): Play =
  val f = line.split(',')
  Play(f(0), f(1), f(2), f(3), f(4).toLong, Some(f(5)))

def deviceLabel(device: Option[String]): String = device match
  case Some("phone") | Some("car") => "mobile"
  case Some("web") => "browser"
  case Some(other) => s"other ($other)"
  case None => "unknown"

def isCounted(play: Play): Boolean = play.msPlayed >= 30_000
