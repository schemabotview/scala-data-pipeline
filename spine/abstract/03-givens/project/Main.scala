// playstream: what a music service's listeners played
import java.nio.file.Path

@main def run(): Unit =
  val counted = readPlays(Path.of("data/plays")).filter(_.isCounted)
  println(s"track ids, sorted: ${catalog.keys.toList.sorted}")
  val byTrack = counted.groupMapReduce(_.trackId)(_ => 1)(_ + _)
  val byArtist = counted.groupMapReduce(play => artistOf(play.trackId))(_ => 1)(_ + _)
  println(s"tracks:  ${topN(byTrack, 3)}")
  println(s"artists: ${topN(byArtist, 3)}")
