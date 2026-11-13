// Anything that happened at a moment
trait Timed:
  def startedAt: String
  def hour: Int = startedAt.slice(11, 13).toInt

def earliest(moments: List[Timed]): Timed = moments.minBy(_.startedAt)
