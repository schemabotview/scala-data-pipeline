// playstream: what a music service's listeners played
@main def run(): Unit =
  val (bad, good) = parseAll(webExport)
  val plays = dedup(good)
  val u01 = plays.filter(_.userId == UserId("u01"))
  println(s"u01: ${u01.length} plays")
  for (session, i) <- sessions(u01).zipWithIndex do
    val minutes = session.map(_.msPlayed).sum.toMinutes
    println(f"  session ${i + 1}: from ${session.head.startedAt.slice(11, 16)}, ${session.length} plays, $minutes%.1f min")
  val all = plays.groupBy(_.userId).values.toList.flatMap(sessions)
  println(s"all listeners: ${all.length} sessions")
