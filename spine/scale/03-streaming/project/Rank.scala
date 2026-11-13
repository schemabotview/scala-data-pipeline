// Ranking anything that has a count
def topN[K](counts: Map[K, Int], n: Int)(using Ordering[K]): List[(K, Int)] =
  counts.toList.sortBy((key, count) => (-count, key)).take(n)
