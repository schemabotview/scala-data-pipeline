// playstream: what a music service's listeners played
@main def run(): Unit =
  val (bad, good) = parseAll(webExport)
  val counted = good.filter(_.isCounted)
  println("Minutes listened, per listener")
  for (user, ms) <- msPerUser(counted).toList.sortBy((_, ms) => -ms) do
    println(f"  $user ${ms.toMinutes}%5.1f")
