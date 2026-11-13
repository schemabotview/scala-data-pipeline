// From plays to answers: the transformations the pipeline is made of
def playsPerTrack(plays: List[Play]): Map[TrackId, Int] =
  plays.groupMapReduce(_.trackId)(_ => 1)(_ + _)
