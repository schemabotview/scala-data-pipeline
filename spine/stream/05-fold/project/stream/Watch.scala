// Watching a folder: new uploads are picked up the moment they arrive
import java.nio.file.{FileSystems, Files, Path}
import java.nio.file.StandardWatchEventKinds.ENTRY_CREATE
import scala.jdk.CollectionConverters.*

val inbox = Path.of("inbox")

@main def watch(expected: Int): Unit =
  Files.createDirectories(inbox)
  val watcher = FileSystems.getDefault.newWatchService()
  inbox.register(watcher, ENTRY_CREATE)  // first watch, then look: nothing slips between
  var seen = Files.list(inbox).iterator.asScala.map(_.getFileName.toString).toSet
  for name <- seen.toList.sorted do println(s"already there: $name")
  println(s"watching $inbox for ${expected - seen.size} more")
  while seen.size < expected do
    val key = watcher.take()
    for event <- key.pollEvents.asScala do
      val name = event.context.toString
      if !seen.contains(name) then
        seen += name
        println(s"picked up $name: ${Files.readAllLines(inbox.resolve(name)).size} events")
    key.reset()
