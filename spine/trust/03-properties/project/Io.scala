// Reading and writing files
import java.nio.file.{Files, Path, StandardCopyOption}
import scala.io.Source
import scala.jdk.CollectionConverters.*
import scala.util.{Try, Using}

def readLines(path: Path): Try[List[String]] =
  Using(Source.fromFile(path.toFile))(_.getLines().toList)

def chartCsv(rows: List[(title: String, plays: Int)]): String =
  val lines = rows.zipWithIndex.map((row, i) => s"${i + 1},${row.title},${row.plays}")
  ("rank,title,plays" :: lines).mkString("", "\n", "\n")

/** All of the new file, or none of it: written aside, then moved into place in one step. */
def write(path: Path, text: String): Unit =
  Files.createDirectories(path.getParent)
  val temp = Files.createTempFile(path.getParent, ".writing-", ".tmp")
  Files.writeString(temp, text)
  Files.move(temp, path, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING)

/** Every export in a folder, parsed and deduplicated. */
def readPlays(dir: Path): List[Play] =
  val files = Files.list(dir).iterator.asScala.toList.sorted
  val (_, good) = parseAll(files.flatMap(file => readLines(file).get.drop(1)))
  dedup(good)
