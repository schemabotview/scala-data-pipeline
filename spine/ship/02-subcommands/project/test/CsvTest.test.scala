// A CSV file read back must give back what was written
import org.scalacheck.Gen
import org.scalacheck.Prop.forAll

class CsvTest extends munit.ScalaCheckSuite:
  // A fixed seed: the same random titles on every run, so a failure can be replayed
  override def scalaCheckInitialSeed = "gWy7tWqJa73VQy8l8aL39tQWUA9nSv978M37o1I4WQK="

  property("a chart row survives a round trip"):
    forAll(Gen.asciiPrintableStr) { title =>
      val written = toCsv(List(ChartRow(1, title, "Mara Quell", 10)))
      val row = written.linesIterator.drop(1).next()
      readCsvLine(row) == List("1", title, "Mara Quell", "10")
    }
