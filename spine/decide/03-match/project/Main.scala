// playstream: what a music service's listeners played
@main def run(): Unit =
  for play <- today do
    val label = play.device match
      case Some("phone") | Some("car") => "mobile"
      case Some("web") => "browser"
      case Some(other) => s"other ($other)"
      case None => "unknown"
    println(s"${play.eventId} on $label")
