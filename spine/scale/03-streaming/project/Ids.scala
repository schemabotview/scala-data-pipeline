// Ids that can't be mixed up: a String at run time, a type of its own at compile time
opaque type UserId = String
object UserId:
  def apply(id: String): UserId = id
  given Ordering[UserId] = Ordering.String
  given CanEqual[UserId, UserId] = CanEqual.derived

opaque type TrackId = String
object TrackId:
  def apply(id: String): TrackId = id
  given Ordering[TrackId] = Ordering.String
  given CanEqual[TrackId, TrackId] = CanEqual.derived
