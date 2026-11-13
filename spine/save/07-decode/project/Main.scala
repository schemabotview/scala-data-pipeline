// playstream: what a music service's listeners played
import java.nio.file.Path

@main def run(): Unit =
  val lines = readLines(Path.of("data/uploads/phone-u03.jsonl")).get
  val (bad, events) = lines.zipWithIndex.partitionMap((line, i) => decode(line).left.map(e => (i + 1, e)))
  println(s"${events.length} events, ${bad.length} rejected")
  for event <- events do
    println(s"  ${event.describe}")
  for (line, error) <- bad do
    println(s"  line $line refused: ${error.message}")
