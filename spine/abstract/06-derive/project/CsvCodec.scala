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

def toCsv[A](rows: List[A])(using codec: CsvCodec[A]): String =
  (codec.header :: rows.map(codec.row)).map(_.mkString(",")).mkString("", "\n", "\n")

case class ChartRow(rank: Int, title: String, artist: String, plays: Int) derives CsvCodec
case class ListenerRow(user: String, plays: Int, minutes: Long) derives CsvCodec
