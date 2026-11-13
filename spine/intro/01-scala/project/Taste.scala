// A taste of Scala: three plays, totalled per track
case class Play(track: String, ms: Int)

@main def taste(): Unit =
  val plays = List(Play("t01", 214_000), Play("t02", 198_000), Play("t01", 61_000))
  val perTrack = plays.groupMapReduce(_.track)(_.ms)(_ + _)
  println(perTrack)
