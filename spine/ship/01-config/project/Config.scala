// Settings, in layers: defaults, a file, the environment, flags; each overrides the one before
import java.nio.file.{Files, Path}
import scala.jdk.CollectionConverters.*

case class Config(dataDir: String, outDir: String, top: Int, zone: String)

object Config:
  val defaults = Map("data" -> "data/plays", "out" -> "out", "top" -> "5", "zone" -> "America/New_York")

  def fromFile(path: Path): Map[String, String] =
    if !Files.exists(path) then Map.empty
    else Files.readAllLines(path).asScala.toList.map(_.trim)
      .filter(line => line.nonEmpty && !line.startsWith("#"))
      .collect { case s"$key=$value" => key.trim -> value.trim }
      .toMap

  def fromEnv(env: Map[String, String]): Map[String, String] =
    env.collect { case (s"PLAYSTREAM_$key", value) => key.toLowerCase -> value }

  def fromFlags(args: Seq[String]): Map[String, String] =
    args.collect { case s"--$key=$value" => key -> value }.toMap

  /** Every setting, with the layer it came from: the last layer to set it wins. */
  def layered(args: Seq[String]): Map[String, (String, String)] =
    List("default" -> defaults, "file" -> fromFile(Path.of("playstream.conf")),
      "env" -> fromEnv(sys.env), "flag" -> fromFlags(args))
      .flatMap((layer, settings) => settings.map((key, value) => key -> (value, layer)))
      .toMap

  def load(args: Seq[String]): Config =
    val value = layered(args).view.mapValues(_._1).toMap
    Config(value("data"), value("out"), value("top").toInt, value("zone"))

@main def settings(args: String*): Unit =
  for (key, (value, layer)) <- Config.layered(args).toList.sortBy(_._1) do
    println(f"$key%-5s = $value%-18s from $layer")
