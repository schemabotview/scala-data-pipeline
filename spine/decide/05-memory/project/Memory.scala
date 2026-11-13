// Where a play lives: frames on the stack, objects on the heap
case class Play(eventId: String, userId: String, trackId: String, startedAt: String, msPlayed: Long, device: Option[String])

def parse(line: String): Play =
  val f = line.split(',')
  for frame <- Thread.currentThread.getStackTrace.drop(1).take(3) do
    println(s"frame: ${frame.getMethodName}, line ${frame.getLineNumber}")
  Play(f(0), f(1), f(2), f(3), f(4).toLong, Some(f(5)))

@main def run(): Unit =
  val play = parse("e0001,u01,t03,2026-10-01T07:12:05Z,214000,phone")
  println(play)
  val n = 1_000_000
  val rt = Runtime.getRuntime
  def used() = { System.gc(); rt.totalMemory - rt.freeMemory }
  val before = used()
  val many = Array.fill(n)(play.copy())
  val after = used()
  println(s"${many.length} plays: about ${math.round((after - before).toDouble / n)} bytes each")
