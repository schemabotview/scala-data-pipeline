// The parser, checked: one good row, one bad one
class ParseTest extends munit.FunSuite:
  test("a good row becomes a Play"):
    val play = parse("e0001,u01,t03,2026-10-01T07:12:05Z,214000,phone")
    assertEquals(play.map(_.eventId), Right("e0001"))
    assertEquals(play.map(_.device), Right(Some(Device.Phone)))

  test("3x is not a number"):
    assertEquals(parse("e0007,u03,t05,2026-10-01T09:14:51Z,3x,web"), Left(ParseError.BadNumber("3x")))
