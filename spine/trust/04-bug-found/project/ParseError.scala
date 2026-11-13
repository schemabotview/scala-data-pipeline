// Everything that can be wrong with a line, and how to say it
enum ParseError:
  case WrongFieldCount(found: Int)
  case BadNumber(text: String)
  case UnknownTrack(id: String)
  case NegativeDuration(ms: Long)
  case BadUpload(reason: String)

  def message: String = this match
    case WrongFieldCount(n) => s"$n fields, not 6"
    case BadNumber(text) => s"not a number: $text"
    case UnknownTrack(id) => s"unknown track: $id"
    case NegativeDuration(ms) => s"negative duration: $ms"
    case BadUpload(reason) => reason
