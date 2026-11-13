// One way to write any case class as CSV: its header and rows, derived from its fields
import scala.compiletime.constValueTuple
import scala.deriving.Mirror

trait CsvCodec[A]:
  def header: List[String]
  def row(a: A): List[String]

object CsvCodec:
  inline def derived[A <: Product](using m: Mirror.ProductOf[A]): CsvCodec[A] =
    fromNames(constValueTuple[m.MirroredElemLabels].toList.map(_.toString))

  private def fromNames[A <: Product](names: List[String]): CsvCodec[A] = new CsvCodec[A]:
    def header = names
    def row(a: A) = a.productIterator.map(_.toString).toList

/** A cell that holds a comma or a quote is quoted, and its quotes doubled (RFC 4180). */
def csvCell(cell: String): String =
  if cell.exists(c => c == ',' || c == '"') then "\"" + cell.replace("\"", "\"\"") + "\"" else cell

def readCsvLine(line: String): List[String] =
  val cells = List.newBuilder[String]
  val cell = StringBuilder()
  var quoted = false
  var i = 0
  while i < line.length do
    line(i) match
      case '"' if quoted && i + 1 < line.length && line(i + 1) == '"' => cell += '"'; i += 1
      case '"' => quoted = !quoted
      case ',' if !quoted => cells += cell.result(); cell.clear()
      case c => cell += c
    i += 1
  (cells += cell.result()).result()

def toCsv[A](rows: List[A])(using codec: CsvCodec[A]): String =
  (codec.header :: rows.map(codec.row)).map(_.map(csvCell).mkString(",")).mkString("", "\n", "\n")

case class ChartRow(rank: Int, title: String, artist: String, plays: Int) derives CsvCodec
case class ListenerRow(user: String, plays: Int, minutes: Long) derives CsvCodec
