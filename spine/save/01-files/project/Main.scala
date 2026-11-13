// playstream: what a music service's listeners played
import java.nio.file.Path
import scala.util.{Failure, Success}

@main def run(): Unit =
  val file = Path.of("data/plays/2026-10-01.csv")
  readLines(file) match
    case Success(lines) =>
      val (bad, good) = parseAll(lines.drop(1))
      println(s"$file: ${lines.length - 1} rows, ${good.length} plays, ${bad.length} rejected")
    case Failure(error) => println(s"could not read $file: $error")
  println(readLines(Path.of("data/plays/2026-10-02.csv")))
