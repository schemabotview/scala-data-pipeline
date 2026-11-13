// The Monoid laws, checked on hundreds of random values
import org.scalacheck.Prop.forAll

class MonoidTest extends munit.ScalaCheckSuite:
  property("combine is associative, for counts per track"):
    forAll { (a: Map[String, Int], b: Map[String, Int], c: Map[String, Int]) =>
      ((a |+| b) |+| c) == (a |+| (b |+| c))
    }

  property("empty changes nothing"):
    forAll { (a: Map[String, Int]) =>
      (a |+| Map.empty) == a && (Map.empty[String, Int] |+| a) == a
    }
