// Reading and writing files
import java.nio.file.{Files, Path}
import scala.io.Source
import scala.util.{Try, Using}

def readLines(path: Path): Try[List[String]] =
  Using(Source.fromFile(path.toFile))(_.getLines().toList)

def chartCsv(rows: List[(title: String, plays: Int)]): String =
  val lines = rows.zipWithIndex.map((row, i) => s"${i + 1},${row.title},${row.plays}")
  ("rank,title,plays" :: lines).mkString("", "\n", "\n")

def write(path: Path, text: String): Unit =
  Files.createDirectories(path.getParent)
  Files.writeString(path, text)
