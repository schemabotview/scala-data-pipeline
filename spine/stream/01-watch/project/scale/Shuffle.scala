// A shuffle by hand: every play goes to the partition its track's hash picks
import java.nio.file.{Files, Path}
import scala.io.Source
import scala.util.Using

val shuffleDir = Path.of("out/shuffle")

def partitionOf(line: String, parts: Int): Int =
  Math.floorMod(line.split(",", 4)(2).hashCode, parts)

@main def partition(parts: Int): Unit =
  Files.createDirectories(shuffleDir)
  val writers = Vector.tabulate(parts)(i => Files.newBufferedWriter(shuffleDir.resolve(s"part-$i.csv")))
  try
    Using.resource(Source.fromFile(bigFile.toFile)) { source =>
      for line <- source.getLines().drop(1) do writers(partitionOf(line, parts)).write(line + "\n")
    }
  finally writers.foreach(_.close())
  println(s"$parts partitions written to $shuffleDir")

/** A hot track's plays are spread by event id; every other track keeps its own partition. */
def saltedPartitionOf(line: String, parts: Int, hot: Set[String]): Int =
  val fields = line.split(",", 4)
  val key = if hot.contains(fields(2)) then fields(0) else fields(2)
  Math.floorMod(key.hashCode, parts)

@main def partitionSalted(parts: Int, hotTrack: String): Unit =
  Files.createDirectories(shuffleDir)
  val writers = Vector.tabulate(parts)(i => Files.newBufferedWriter(shuffleDir.resolve(s"part-$i.csv")))
  try
    Using.resource(Source.fromFile(bigFile.toFile)) { source =>
      for line <- source.getLines().drop(1) do writers(saltedPartitionOf(line, parts, Set(hotTrack))).write(line + "\n")
    }
  finally writers.foreach(_.close())
  println(s"$parts partitions written to $shuffleDir, $hotTrack spread over all of them")
