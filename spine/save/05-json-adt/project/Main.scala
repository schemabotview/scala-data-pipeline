// playstream: what a music service's listeners played
@main def run(): Unit =
  val like = Json.Obj(List(
    "type" -> Json.Str("like"),
    "user_id" -> Json.Str("u03"),
    "track_id" -> Json.Str("t03"),
    "devices" -> Json.Arr(List(Json.Str("phone"), Json.Null)),
    "ms" -> Json.Num(214000)
  ))
  println(like)
  println(like.render)
