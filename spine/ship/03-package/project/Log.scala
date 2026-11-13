// What the pipeline did, said through the JDK's own logger
import java.lang.System.Logger.Level

// The format travels with the code: a packaged jar has no project.scala to read it from
val log =
  System.setProperty("java.util.logging.SimpleFormatter.format", "%4$s %3$s: %5$s%n")
  System.getLogger("playstream")

def info(message: String): Unit = log.log(Level.INFO, message)
def warn(message: String): Unit = log.log(Level.WARNING, message)
