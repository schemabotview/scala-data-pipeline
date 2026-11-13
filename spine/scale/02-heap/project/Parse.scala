// Turning text into plays
def parse(line: String): Either[ParseError, Play] =
  val f = line.split(",", -1)
  for
    _ <- Either.cond(f.length == 6, (), ParseError.WrongFieldCount(f.length))
    ms <- f(4).toLongOption.toRight(ParseError.BadNumber(f(4)))
    track <- Either.cond(catalog.contains(TrackId(f(2))), TrackId(f(2)), ParseError.UnknownTrack(f(2)))
    play <- Play.from(f(0), UserId(f(1)), track, f(3), ms, Device.values.find(_.toString.equalsIgnoreCase(f(5))))
  yield play

def parseAll(lines: List[String]): (List[(Int, ParseError)], List[Play]) =
  lines.zipWithIndex.partitionMap((line, i) =>
    parse(line).left.map(error => (i + 2, error))
  )

def deviceLabel(device: Option[Device]): String = device match
  case Some(Device.Phone) | Some(Device.Car) => "mobile"
  case Some(Device.Web) => "browser"
  case None => "unknown"
