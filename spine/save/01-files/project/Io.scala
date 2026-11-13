// Reading and writing files
import java.nio.file.Path
import scala.io.Source
import scala.util.{Try, Using}

def readLines(path: Path): Try[List[String]] =
  Using(Source.fromFile(path.toFile))(_.getLines().toList)
