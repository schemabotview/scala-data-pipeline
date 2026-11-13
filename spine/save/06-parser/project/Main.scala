// playstream: what a music service's listeners played
@main def run(): Unit =
  val samples = List(
    """{"type":"like","user_id":"u03","ms":[214000, null, true]}""",
    """{"type":"like" "user_id":"u03"}""",
    """{"type":"play","event_id":"e1003","user_id":"u03","track_id":"t0"""
  )
  for sample <- samples do
    JsonParser.parse(sample) match
      case Right(json) => println(s"ok: ${json.render}")
      case Left(problem) => println(s"refused, $problem")
