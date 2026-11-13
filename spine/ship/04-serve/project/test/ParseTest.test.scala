// The parser, checked: one good row, and every kind of bad one
class ParseTest extends munit.FunSuite:
  test("a good row becomes a Play"):
    val play = parse("e0001,u01,t03,2026-10-01T07:12:05Z,214000,phone")
    assertEquals(play.map(_.eventId), Right("e0001"))
    assertEquals(play.map(_.device), Right(Some(Device.Phone)))

  val badRows = List(
    "e0007,u03,t05,2026-10-01T09:14:51Z,3x,web" -> ParseError.BadNumber("3x"),
    "e0008,u05,t99,2026-10-01T09:20:07Z,187000,phone" -> ParseError.UnknownTrack("t99"),
    "e0009,u01,t01,2026-10-01T09:31:12Z" -> ParseError.WrongFieldCount(4),
    "e0011,u04,t02,2026-10-01T10:05:00Z,-3000,web" -> ParseError.NegativeDuration(-3000)
  )

  for (line, expected) <- badRows do
    test(s"refuses ${line.take(5)}: ${expected.message}"):
      assertEquals(parse(line), Left(expected))
