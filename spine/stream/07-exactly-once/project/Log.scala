// What the pipeline did, said through the JDK's own logger
import java.lang.System.Logger.Level

val log = System.getLogger("playstream")

def info(message: String): Unit = log.log(Level.INFO, message)
def warn(message: String): Unit = log.log(Level.WARNING, message)
