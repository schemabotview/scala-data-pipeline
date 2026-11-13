// Ten million synthetic plays, the same ones on every run: a seeded generator
import java.nio.file.{Files, Path}
import scala.util.{Random, Using}

val bigFile = Path.of("data/big/plays.csv")

@main def generate(n: Int): Unit =
  val random = Random(20261001)
  val tracks = catalog.keys.toVector.sorted
  val devices = Vector("phone", "phone", "web", "car")
  Files.createDirectories(bigFile.getParent)
  Using.resource(Files.newBufferedWriter(bigFile)) { out =>
    out.write("event_id,user_id,track_id,started_at,ms_played,device\n")
    for i <- 1 to n do
      // One track has gone viral: 40% of all plays are Slow Tide
      val track = if random.nextDouble() < 0.4 then TrackId("t03") else tracks(random.nextInt(tracks.length))
      val second = random.nextInt(86_400)
      val user = f"u${random.nextInt(50_000)}%05d"
      val start = f"2026-10-01T${second / 3600}%02d:${second / 60 % 60}%02d:${second % 60}%02dZ"
      out.write(s"e$i,$user,$track,$start,${30_000 + random.nextInt(200_000)},${devices(random.nextInt(4))}\n")
  }
  println(f"wrote $n%,d plays to $bigFile (${Files.size(bigFile) / 1_000_000}%,d MB)")
