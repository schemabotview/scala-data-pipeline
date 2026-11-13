// A JSON parser by hand: one method per kind of value, calling each other as JSON nests
import scala.annotation.tailrec

class JsonParser(text: String):
  private var pos = 0

  def parseAll(): Either[String, Json] =
    try
      val value = parseValue()
      skipSpaces()
      if pos == text.length then Right(value) else fail("the end of the line")
    catch case e: JsonParser.Failed => Left(e.getMessage)

  private def fail(expected: String): Nothing =
    throw JsonParser.Failed(s"column ${pos + 1}: expected $expected")

  @tailrec private def skipSpaces(): Unit =
    if pos < text.length && text(pos).isWhitespace then
      pos += 1
      skipSpaces()

  private def parseValue(): Json =
    skipSpaces()
    if pos >= text.length then fail("a value")
    text(pos) match
      case '{' => Json.Obj(elements('}')(field()))
      case '[' => Json.Arr(elements(']')(parseValue()))
      case '"' => Json.Str(parseString())
      case 't' => word("true", Json.Bool(true))
      case 'f' => word("false", Json.Bool(false))
      case 'n' => word("null", Json.Null)
      case c if c == '-' || c.isDigit => parseNumber()
      case _ => fail("a value")

  private def word(w: String, value: Json): Json =
    if !text.startsWith(w, pos) then fail(w)
    pos += w.length
    value

  /** A string without escapes: the uploads have none (a full parser handles \\" and \\u). */
  private def parseString(): String =
    val start = pos + 1
    pos = text.indexOf('"', start)
    if pos < 0 then
      pos = text.length
      fail("a closing quote")
    pos += 1
    text.substring(start, pos - 1)

  private def parseNumber(): Json =
    val start = pos
    while pos < text.length && "+-.eE0123456789".contains(text(pos)) do pos += 1
    text.substring(start, pos).toDoubleOption.map(Json.Num(_)).getOrElse(fail("a number"))

  private def field(): (String, Json) =
    skipSpaces()
    if pos >= text.length || text(pos) != '"' then fail("a field name")
    val name = parseString()
    skipSpaces()
    if pos >= text.length || text(pos) != ':' then fail("':'")
    pos += 1
    (name, parseValue())

  /** The items of an array or the fields of an object: `one`, separated by commas, until `close`. */
  private def elements[A](close: Char)(one: => A): List[A] =
    pos += 1
    skipSpaces()
    if pos < text.length && text(pos) == close then
      pos += 1
      Nil
    else more(close, List(one))(one)

  @tailrec private def more[A](close: Char, done: List[A])(one: => A): List[A] =
    skipSpaces()
    if pos < text.length && text(pos) == ',' then
      pos += 1
      more(close, one :: done)(one)
    else if pos < text.length && text(pos) == close then
      pos += 1
      done.reverse
    else fail(s"',' or '$close'")

object JsonParser:
  class Failed(message: String) extends Exception(message)
  def parse(text: String): Either[String, Json] = JsonParser(text).parseAll()
