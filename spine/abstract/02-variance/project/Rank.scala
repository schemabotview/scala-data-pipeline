// Ranking anything that has a count
def topN[K](counts: Map[K, Int], n: Int)(name: K => String): List[(String, Int)] =
  counts.toList
    .sortBy((key, count) => (-count, name(key)))
    .take(n)
    .map((key, count) => (name(key), count))
