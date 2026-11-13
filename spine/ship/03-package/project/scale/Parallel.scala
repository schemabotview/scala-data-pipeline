// Every partition on its own core, and the partial answers combined
import java.nio.file.Files
import scala.concurrent.{Await, Future}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration.Duration
import scala.jdk.CollectionConverters.*

@main def parallel(): Unit =
  val parts = Files.list(shuffleDir).iterator.asScala.toList.sorted
  println(s"${parts.length} partitions, ${Runtime.getRuntime.availableProcessors} cores")
  val one = timed("one core")(combineAll(parts.map(countTracks(_, header = false))))
  val all = timed("every core") {
    val partials = Future.traverse(parts)(part => Future(countTracks(part, header = false)))
    combineAll(Await.result(partials, Duration.Inf))
  }
  println(s"same answer: ${one == all}")
