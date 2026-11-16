# Thumbnails

`film.png` — the thumbnail for the single full-course video (`scripts/out/film.mp4`). Rebuild it,
or a variant, with:

```sh
npm run thumb:film                                                         # → film.png (dark, pipeline, logo)
npm run thumb:film -- --mark glyph                                         # the `=>` mark instead of the logo
npm run thumb:film -- --theme light --out output/thumbnails/film-light.png
npm run thumb:film -- --source chart --out output/thumbnails/film-chart.png
```

Variants kept for comparison: `film-light.png` (stands out in a dark feed) and `film-chart.png`
(the other source: the chart rows curl got back, and the date the server refused).

## Every label is real

Both sources are cut from ONE spine step, §12.4 `spine/ship/04-serve`: the `serve` command, the
URL it announced and every GET it logged come from `session.txt`; the folder (`data/plays`) is
Config.scala's default and the file (`out/date=<date>/chart.csv`) is the one Server.scala reads.
A missing line is a hard error. After a replay changes that session, re-run `thumb:film`.

## The mark: the Scala logo (or `=>`)

The cover carries the Scala spiral, unaltered, with a ™ (`public/vendor/scala-spiral.svg`; source
and terms in `public/vendor/NOTICE-scala-logo.txt`). The logo is a trademark of EPFL (managed by
the Scala Center), and the ™ is not permission. `--mark glyph` builds the cover with the repo's own
mark instead, `=>` drawn as two strokes and a chevron: punctuation, which nobody owns.
