// Turning text into plays
def parse(line: String): Either[String, Play] =
  val f = line.split(",", -1)
  for
    _ <- Either.cond(f.length == 6, (), s"${f.length} fields, not 6")
    ms <- f(4).toLongOption.toRight(s"not a number: ${f(4)}")
    track <- Either.cond(catalog.contains(TrackId(f(2))), TrackId(f(2)), s"unknown track: ${f(2)}")
    play <- Play.from(f(0), UserId(f(1)), track, f(3), ms, Device.values.find(_.toString.equalsIgnoreCase(f(5))))
  yield play

def parseAll(text: String): (List[String], List[Play]) =
  text.linesIterator.drop(1).toList.zipWithIndex.partitionMap((line, i) =>
    parse(line).left.map(problem => s"line ${i + 2}: $problem")
  )

def deviceLabel(device: Option[Device]): String = device match
  case Some(Device.Phone) | Some(Device.Car) => "mobile"
  case Some(Device.Web) => "browser"
  case None => "unknown"

def isCounted(play: Play): Boolean = play.msPlayed >= 30_000
