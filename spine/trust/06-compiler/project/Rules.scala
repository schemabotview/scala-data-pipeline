// Rules about plays, written as methods on the types they are about
extension (ms: Long)
  def toMinutes: Double = ms / 60_000.0

extension (play: Play)
  def isCounted: Boolean = play.msPlayed >= 30_000
  def deviceKind: String = deviceLabel(play.device)
