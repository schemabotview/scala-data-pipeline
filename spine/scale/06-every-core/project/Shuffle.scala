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
