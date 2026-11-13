// playstream: what a music service's listeners played
@main def run(): Unit =
  println(3 |+| 4)
  println(214_000L |+| 198_000L)
  val monday = Map("t03" -> 2, "t05" -> 1)
  val tuesday = Map("t03" -> 1, "t01" -> 4)
  println(monday |+| tuesday)
  println(summon[Monoid[Map[String, Int]]].empty)
