// JSON, as a Scala type: every JSON value is exactly one of these
enum Json derives CanEqual:
  case Null
  case Bool(value: Boolean)
  case Num(value: Double)
  case Str(value: String)
  case Arr(items: List[Json])
  case Obj(fields: List[(String, Json)])

  def render: String = this match
    case Null => "null"
    case Bool(b) => b.toString
    case Num(n) => if n.isWhole then n.toLong.toString else n.toString
    case Str(s) => quoted(s)
    case Arr(items) => items.map(_.render).mkString("[", ",", "]")
    case Obj(fields) => fields.map((k, v) => s"${quoted(k)}:${v.render}").mkString("{", ",", "}")

private def quoted(s: String): String = "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\""
