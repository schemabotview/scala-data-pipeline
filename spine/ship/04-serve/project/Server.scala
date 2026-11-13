// The charts over HTTP: GET /charts/<date> answers with that day's chart, as JSON
import com.sun.net.httpserver.{HttpExchange, HttpServer}
import java.net.InetSocketAddress
import java.nio.file.{Files, Path}
import scala.jdk.CollectionConverters.*

def chartJson(file: Path): Json = Json.Arr(
  Files.readAllLines(file).asScala.toList.drop(1).map(readCsvLine).collect { case List(rank, title, artist, plays) =>
    Json.Obj(List("rank" -> Json.Num(rank.toDouble), "title" -> Json.Str(title),
      "artist" -> Json.Str(artist), "plays" -> Json.Num(plays.toDouble)))
  })

def answer(config: Config, date: String): (Int, Json) =
  val file = Path.of(s"${config.outDir}/date=$date/chart.csv")
  // Only a date reaches the disk: anything else (../../etc/passwd) is refused before a path is built
  if date.matches("""\d{4}-\d{2}-\d{2}""") && Files.exists(file) then (200, chartJson(file))
  else (404, Json.Obj(List("error" -> Json.Str(s"no chart for $date"))))

def serve(config: Config): Unit =
  val server = HttpServer.create(InetSocketAddress(8080), 0)
  server.createContext("/charts/", (exchange: HttpExchange) =>
    val (status, json) = answer(config, exchange.getRequestURI.getPath.stripPrefix("/charts/"))
    info(s"GET ${exchange.getRequestURI}: $status")
    val body = json.render.getBytes("UTF-8")
    exchange.getResponseHeaders.set("Content-Type", "application/json")
    exchange.sendResponseHeaders(status, body.length)
    exchange.getResponseBody.write(body)
    exchange.close()
  )
  server.start()
  info("serving charts on http://localhost:8080/charts/<date>")
