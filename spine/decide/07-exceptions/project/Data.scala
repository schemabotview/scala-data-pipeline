// The data, until files arrive (course 7)
val today = List(
  Play("e0001", "u01", "t03", "2026-10-01T07:12:05Z", 214_000, Some("phone")),
  Play("e0002", "u02", "t01", "2026-10-01T07:30:41Z", 198_000, None),
  Play("e0003", "u01", "t04", "2026-10-01T07:16:02Z", 61_000, Some("phone")),
  Play("e0004", "u03", "t03", "2026-10-01T08:02:19Z", 214_000, Some("web")),
  Play("e0005", "u02", "t02", "2026-10-01T08:45:00Z", 176_000, Some("car")),
  Play("e0006", "u04", "t02", "2026-10-01T09:01:33Z", 12_000, Some("web"))
)

val catalog = Map(
  "t01" -> "Northern Lights",
  "t02" -> "Paper Boats",
  "t03" -> "Slow Tide",
  "t04" -> "Glasshouse",
  "t05" -> "Night Bus"
)

val webExport = """event_id,user_id,track_id,started_at,ms_played,device
e0001,u01,t03,2026-10-01T07:12:05Z,214000,phone
e0002,u02,t01,2026-10-01T07:30:41Z,198000,
e0003,u01,t04,2026-10-01T07:16:02Z,61000,phone
e0007,u03,t05,2026-10-01T09:14:51Z,3x,web
e0008,u05,t99,2026-10-01T09:20:07Z,187000,phone
e0009,u01,t01,2026-10-01T09:31:12Z
e0010,u02,t05,2026-10-01T09:40:55Z,240000,car"""
