// playstream: what a music service's listeners played
@main def run(): Unit =
  val (bad, good) = parseAll(webExport)
  println(s"${good.length} plays, ${bad.length} rejected")
  val events = List(
    Event.Played(good.head),
    Event.Skipped("u02", "t04", "2026-10-01T10:02:11Z", 9_000),
    Event.Liked("u01", "t03")
  )
  for event <- events do
    println(describe(event))

def describe(event: Event): String = event match
  case Event.Played(play) => s"${play.userId} played ${catalog(play.trackId)}"
  case Event.Skipped(user, track, _, after) => s"$user skipped ${catalog(track)} after ${after / 1000} s"
  case Event.Liked(user, track) => s"$user liked ${catalog(track)}"
