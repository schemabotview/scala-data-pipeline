// Sorting more than fits in memory: sorted runs on disk, then one merge
import java.nio.file.{Files, Path}
import scala.collection.mutable
import scala.io.Source
import scala.jdk.CollectionConverters.*
import scala.util.Using

val runsDir = Path.of("out/runs")
val sortedFile = Path.of("out/sorted.csv")

/** Listener first, then time: the order sessions need. */
def sortKey(line: String): String =
  val fields = line.split(",", 5)
  fields(1) + fields(3)

@main def externalSort(runSize: Int): Unit =
  Files.createDirectories(runsDir)
  val runs = Using.resource(Source.fromFile(bigFile.toFile)) { source =>
    source.getLines().drop(1).grouped(runSize).zipWithIndex.map { (chunk, i) =>
      val run = runsDir.resolve(f"run-$i%02d.csv")
      Files.write(run, chunk.sortBy(sortKey).asJava)
      run
    }.toList
  }
  println(s"${runs.length} sorted runs of up to $runSize lines")
  val sources = runs.map(run => Source.fromFile(run.toFile))
  try
    val heads = sources.map(_.getLines().buffered)
    val queue = mutable.PriorityQueue.empty[(String, Int)](using Ordering.by[(String, Int), String](_._1).reverse)
    for (run, i) <- heads.zipWithIndex if run.hasNext do queue.enqueue((sortKey(run.head), i))
    Using.resource(Files.newBufferedWriter(sortedFile)) { out =>
      var written = 0L
      while queue.nonEmpty do
        val (_, i) = queue.dequeue()
        out.write(heads(i).next() + "\n")
        written += 1
        if heads(i).hasNext then queue.enqueue((sortKey(heads(i).head), i))
      println(s"merged $written lines into $sortedFile")
    }
  finally sources.foreach(_.close())
