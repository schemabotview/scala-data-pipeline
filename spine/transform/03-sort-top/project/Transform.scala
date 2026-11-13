// From plays to answers: the transformations the pipeline is made of
def playsPerTrack(plays: List[Play]): Map[TrackId, Int] =
  plays.groupMapReduce(_.trackId)(_ => 1)(_ + _)

def topTracks(plays: List[Play], n: Int): List[(title: String, plays: Int)] =
  playsPerTrack(plays).toList
    .sortBy((track, count) => (-count, catalog(track)))
    .take(n)
    .map((track, count) => (title = catalog(track), plays = count))
