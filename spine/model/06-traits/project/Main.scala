// playstream: what a music service's listeners played
@main def run(): Unit =
  val (bad, good) = parseAll(webExport)
  val skip = Event.Skipped(UserId("u02"), TrackId("t04"), "2026-10-01T10:02:11Z", 9_000)
  val moments: List[Timed] = good :+ skip
  for moment <- moments do
    println(s"${moment.startedAt} is in hour ${moment.hour}")
