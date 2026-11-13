// Monoid: a way to combine two values of a type, and an empty one to start from
trait Monoid[A]:
  def empty: A
  def combine(x: A, y: A): A

extension [A](x: A)(using m: Monoid[A])
  def |+|(y: A): A = m.combine(x, y)

given Monoid[Int] with
  def empty = 0
  def combine(x: Int, y: Int) = x + y

given Monoid[Long] with
  def empty = 0L
  def combine(x: Long, y: Long) = x + y

given [K, V](using v: Monoid[V]): Monoid[Map[K, V]] with
  def empty = Map.empty
  def combine(x: Map[K, V], y: Map[K, V]) =
    y.foldLeft(x)((acc, entry) =>
      val (key, value) = entry
      acc.updated(key, acc.get(key).fold(value)(v.combine(_, value)))
    )

given [A, B](using a: Monoid[A], b: Monoid[B]): Monoid[(A, B)] with
  def empty = (a.empty, b.empty)
  def combine(x: (A, B), y: (A, B)) = (a.combine(x._1, y._1), b.combine(x._2, y._2))

def combineAll[A](values: List[A])(using m: Monoid[A]): A =
  values.foldLeft(m.empty)(m.combine)
