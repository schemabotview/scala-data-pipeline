// Where the time goes: each stage on its own, measured
import scala.io.Source
import scala.util.Using

def timed[A](label: String)(body: => A): A =
  val start = System.nanoTime
  val result = body
  println(f"$label%-12s ${(System.nanoTime - start) / 1_000_000}%,7d ms")
  result

def lines[A](use: Iterator[String] => A): A =
  Using.resource(Source.fromFile(bigFile.toFile))(source => use(source.getLines().drop(1)))

@main def measure(): Unit =
  timed("read")(lines(_.size))
  timed("split")(lines(_.map(_.split(",", -1)).size))
  timed("parse")(lines(_.map(parse).size))
  timed("aggregate")(countTracks(bigFile, header = true).size)
