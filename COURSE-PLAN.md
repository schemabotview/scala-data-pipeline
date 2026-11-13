# Learn Scala by building a data pipeline: full course, beginner to professional — plan

**Plan status:** v1, scope agreed with the owner (2026-11-13): big data engineering as the theme, a
standalone app (standard library + JDK only, like python-expense-tracker), no Spark or other
framework in the story; the service is Play-Stream. Infra is in; Course 2 (the pilot) is authored
and awaits review. Shared rules (section shape,
◆ detours, packaging, build order) are in `../CLAUDE.md`; this plan states only what is specific
to Scala.

## The idea

One application, `playstream`, the data pipeline of a fictional music-streaming service. It reads
the listening events that phones and the web player upload (who played which track, when, for how
long, on which device), cleans them, removes duplicates, and computes daily charts, listening
sessions and per-artist plays, written as date-partitioned reports. It grows from a script that
counts three plays to a tested, packaged pipeline that processes ten million events on every core
in constant memory, follows live uploads as they arrive, and serves its charts over HTTP. Every
Scala feature is taught **when the pipeline first needs it**. Background topics (what the compiler
does, the JVM's memory and GC, why associativity lets work split across cores) appear as short
detours at the moment they answer a question on screen. They are never front-loaded.

Why a data pipeline:

- **It is Scala's home turf.** Data engineering is where most Scala is written, and the shape of
  the work (typed records, transformations over collections, folds, partitions, streams) is the
  shape of the language. The app is a small version of real work, not a classroom exercise.
- **Everyone understands it.** Everyone has played music; plays, skips, charts and "you listened
  for 3 hours today" need no explaining.
- **The machinery is built, not imported.** Partitioning, a shuffle, an external sort, event-time
  windows, watermarks and checkpoints are written by hand from the standard library. The viewer
  learns Scala AND the ideas every data framework is made of, without a framework taking the
  attention. Frameworks appear once, in "Where next" (12.6).
- **It grows the way Scala is used**: a script → a typed domain → a library of transformations →
  a parallel batch job → a streaming job → a shipped command with an HTTP endpoint.
- **Each need pulls in a feature**: an event needs a case class; a missing field needs `Option`;
  bad rows need `Either` and for-comprehensions; event kinds need `enum` ADTs and exhaustive
  `match`; ids that must never be mixed need opaque types; phone uploads need a JSON parser of our
  own (a recursive ADT); one way to read and write any row needs `given` and derivation;
  aggregates that split across cores need a `Monoid`; ten million rows need iterators and laziness;
  every core needs `Future`s. Nothing is taught for its own sake.

**Who it's for:** a beginner to Scala. Some programming in any language helps; nothing about the
JVM or functional programming is assumed.

It does not repeat python-expense-tracker (one person's spending, a CLI and a web API) or java-bank
(a mutable bank with locks): this course is immutable values flowing through transformations, and
its concurrency is splitting work and combining results, not guarding shared state.

## Packaging

**One film: "Learn Scala by building a data pipeline: full course, beginner to professional"** —
12 courses, 83 sections, about 2 h 05 min, one continuous story from the first line to a shipped
pipeline. A section is ~90 s, titled *concept: what the pipeline gets* (e.g. "Opaque types: ids
that can't be mixed up"). The film opens with the finished pipeline's charts and its live stream
(the payoff first). Each section can also go out as a Short (portrait, `record-reels`).

## Stack and pins

| | Pin | Why |
| --- | --- | --- |
| Scala | **3.9.0** (the LTS line; 3.10.1 is the current Next) | A long-lived film should teach the release teams stay on. Every feature below is stable in 3.9 |
| JDK | OpenJDK **25.0.5.0.3** from Ubuntu's archive (`openjdk-25-jdk-headless`, exact build pinned) | java-bank's install path; its 25.0.4.1 is no longer in the archive (Decision 8) |
| scala-cli | **1.19.0**, the JVM launcher from Maven Central (`org.virtuslab.scala-cli:cli_3`) | The one tool, from the first script to the packaged jar (Decision 3) |
| munit / ScalaCheck | 1.3.6 / latest 1.x at pin time, test-only, from Course 9 | Like pytest in the Python course: dev tools, not app dependencies |

Checked 2026-11-13 from the cloud container: Scala 3.9.0, scala-cli 1.19.0, munit 1.3.6 and
ScalaCheck resolve from repo1.maven.org; github.com is blocked (403), so scala-cli's native
launcher and the usual `cs setup` install are out. `scripts/install-scala.sh` resolves scala-cli's
JVM launcher from Maven Central with Maven (Decision 9). `project.scala` pins Scala only: `//> using
jvm 25` makes scala-cli fetch a JVM index from github.com, so the JDK is `JAVA_HOME`.

Scala 3 features used: indentation syntax and `@main` (2), named tuples (3.6), `enum` ADTs and
exhaustiveness (5), opaque types and extension methods (5), `given`/`using` and `derives` with
`Mirror` (8), strict equality (`CanEqual`, 9.6). Experimental features (capture checking) are not
used. The app's only imports are `scala.*` and `java.*`.

## The app: `playstream`

One name everywhere: the folder, the scala-cli project, the jar, the command and the root package
are `playstream`. The service is **Play-Stream**, fictional (the owner's pick, 2026-11-13). The data engineer is Ana;
listeners are synthetic. The project path is normalised to `/home/ana/playstream`.

```
playstream/
  project.scala             //> using scala 3.9.0 (options later)            (2 →)
  Main.scala                the script a beginner runs, @main                (2 → 6, then the CLI)
  playstream/
    model/  Play (case class), Device, Event (enums), ids (opaque types)     (3, 5)
            ParseError (enum)                                                (4, 5)
    parse/  Csv.scala       a line → Either[ParseError, Play]                (4)
            Json.scala      Json ADT + a recursive-descent parser            (7)
            Decode.scala    Json → Play                                      (7)
    transform/  Charts, Sessions, Dedup                                      (6)
    agg/    Monoid, instances, combineAll                                    (8)
    codec/  CsvCodec type class, derived from case classes                   (8)
    io/     Reports: partitioned, atomic writes                              (7)
    scale/  Partition (shuffle by hand), ExternalSort, Parallel              (10)
    stream/ Watcher, Windows, Watermark, Checkpoint                          (11)
    cli/    Config, subcommands                                              (12)
    api/    Server: JDK HttpServer, GET /charts/<date>                       (12)
  test/     munit + ScalaCheck                                               (9 →)
  data/catalog.csv          tracks: id, title, artist, length                (3)
  data/plays/*.csv          the web player's daily exports                   (4)
  data/uploads/*.jsonl      the phones' uploads                              (7)
  data/gen/                 10M seeded events, regenerated, never committed  (10)
  out/date=YYYY-MM-DD/      what the pipeline writes                         (7)
  checkpoint/               the stream's saved progress                      (11)
```

| After course | The pipeline can… |
| --- | --- |
| 2 Start | count three plays |
| 3 Hold | hold a day of plays and the track catalog as typed values |
| 4 Decide | parse a CSV export, keeping good rows and reporting every bad one |
| 5 Model | type the whole domain: event kinds, devices, ids that can't be mixed |
| 6 Transform | compute daily charts, listening minutes and sessions; drop duplicates |
| 7 Save | read the phones' JSON uploads with its own parser; write partitioned reports, safely re-runnable |
| 8 Abstract | aggregate anything with one `Monoid`; read and write any row with one derived codec |
| 9 Trust | pass its unit and property tests; log; build with the compiler at its strictest |
| 10 Scale | process 10M events in constant memory on every core, its skew fixed |
| 11 Stream | follow live uploads with event-time windows, late plays, and resume after a crash |
| 12 Ship | run as one jar with subcommands, and serve the charts over HTTP |

## The data

Synthetic and owned. `data/catalog.csv` (`track_id,title,artist,length_ms`, ~200 tracks),
`data/plays/plays-2026-10-DD.csv` from the web player
(`event_id,user_id,track_id,started_at,ms_played,device`), and `data/uploads/*.jsonl` from the
phones (one JSON object per line, the same fields plus `uploaded_at`). In Course 10 a seeded
generator (`scala.util.Random(seed)`) writes 10M events: same seed, same file, every replay.

The bad rows are real, each one the reason a feature exists:

| Bad row | Caught by |
| --- | --- |
| `3x` as `ms_played` | 2.6 (an exception: `"3x".toInt`), then 4.8 (`Either`) |
| A play of `-3000` ms | 5.5 (`Play.from`, a smart constructor) |
| A track id not in the catalog | 4.10, reported with the line number |
| The same `event_id` twice (a phone retried the upload) | 6.6 (dedup) |
| A title with a comma and quotes: `"Hello, \"World\""` | 3.3's naive `split` breaks it; 9.4's round-trip property finds it |
| A malformed JSON line (a truncated upload) | 7.7, reported with its column |
| `started_at` without a zone, near midnight | 6.5 (which day is it?) |
| A play uploaded two days late (the phone was offline) | 11.2 (event time), 11.4 (watermarks) |
| One viral track holding 40% of all plays | 10.7 (skew) |

## Frames

**IDE frame v2** from the start (ported from java-bank's `src/scenes/frame.ts`): one 1344 × 756
grid, one fit; compact explorer 175 | editor over a 72-column terminal sharing 26 rows | side pane
434, TITLED with the section's mental model, holding ONE diagram (edges or a plot) and at most one
table. Concept frames for Course 1 and each ◆ full scene, which carries the real output inside the
scene as a `code` node imported from a lab. ◆ side pane = a small picture of the code on screen;
◆ full scene = a canonical big picture that cannot fit the side pane at ≥ 24px body text.

## The spine

`spine/<course>/<NN-step>/` = `project/` + `session.txt` + `step.json`, replayed by
`scripts/spine.py` (ported from java-bank). Every step has exactly one of `first`, `from` +
`changes`, or `lab`. Experiments go in the REPL, never into the app. Scala-specific:

- **The toolchain is set, not found**: `JAVA_HOME`, `PATH` and the scala-cli launcher point at the
  pins. `JAVA_TOOL_OPTIONS` (set by the cloud proxy) is moved out of the JVM's sight, as java-bank
  does, or every transcript starts with "Picked up JAVA_TOOL_OPTIONS".
- **scala-cli's own lines are real output**: "Compiling project (Scala 3.9.0, JVM (25))" stays in
  the transcript, because the viewer sees it too. Each step runs with the machine's warm coursier
  cache, so no download lines appear: the first download is a page of URLs, and 2.1 says it in the
  narration instead. scala-cli colours its output on any terminal; the replay strips it.
- **The REPL** (`scala-cli repl .`) prompts are `scala> ` and `     | ` (continuation); typing waits
  for a NEW prompt, as java-bank's jshell replay does. It prints a blank line between results.
- **Course 10's sizes and timings** are rounded and tied to the build; the 10M file is regenerated
  by the step, never stored.

## The courses

**1. `intro` · Scala, and what we'll build · 2**

| # | Section | Frame | Side pane |
| --- | --- | --- | --- |
| 1 | What Scala is, and where it's used | concept | Scala on the JVM → data engineering, backends, compilers; types + functions in one language |
| 2 | What we'll build | concept | **the app map**: uploads → parse → clean → aggregate → partition → stream → serve; the finished chart |

**2. `start` · The first script · 6**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | scala-cli | `java --version`, `scala-cli version` (default 3.10.1); `project.scala` pins 3.9.0, and `compile .` uses the pin | scala-cli → Scala 3.9.0 (fetched once) → JDK 25 |
| 2 | `Main.scala` | `@main def run()` prints the name, 3 plays, and `214_000 / 60_000` minutes: 3, not 3.57 | `scala-cli run .`: files → compiled → `run()`; Int / Int is an Int |
| 3 | ◆ full scene: what `scala-cli run .` does | concept + lab (`-Vprint:typer`, `--compilation-output`, `javap`) | source → the `run` class @main adds → `.class` + `.tasty` → bytecode (`iconst_3`: folded at compile time) → `main` → output |
| 4 | The REPL beside the editor | `214_000 / 60_000` → `Int = 3`, `/ 60_000.0` → `Double`; line 5 fixed | read → eval → print, with the type |
| 5 | A compile error | `val plays: Int = "3"`; nothing runs; the misspelt `prinln` ("did you mean println?") beside it | every type checked first; error anatomy |
| 6 | An exception | `"3x".toInt`; line 3 already printed | the stack trace read; compile time vs run time |

**3. `hold` · Hold the data · 9**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | `val`, `var` and type inference | `trackId`, `msPlayed` | names → values; a `val` refuses a rebind |
| 2 | Numbers | ms as `Long`; a day's total overflows `Int` | 32 vs 64 bits, the wrap-around |
| 3 | Strings and interpolation | `s"…"`, `f"…"`; `line.split(',')` (naive, on purpose) | the line as cells, split indexes |
| 4 | Case classes | `Play(eventId, userId, trackId, startedAt, msPlayed)` | what a case class generates: `equals`, `copy`, `toString` |
| 5 | `Option` | a play with no `device` | `Some` / `None`, never `null` |
| 6 | Tuples and named tuples | `(track = "t042", plays = 17)` | positional vs named fields |
| 7 | `List` and `Vector` | a day of plays | cons cells vs Vector's tree |
| 8 | `Map` and `Set` | the catalog by id; users seen today | keys → buckets → values |
| 9 | Immutability ◆ side pane: structural sharing | `plays :+ p`; the old list unchanged | two lists sharing one tail |

**4. `decide` · Decide, repeat, react · 10**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Everything is an expression | the day moves to `Data.scala`; `val status = if ms >= 30_000 then "counted" else "skipped"`; a block's last line is its value | the expression tree, one value out |
| 2 | Loops and `for` | total ms of the day; `for … if …` counted plays only | cursor down the list |
| 3 | `match` | each play's `device` (an Option) → a label, inside the loop | the value against each case |
| 4 | Methods ◆ side pane: the call stack | `Parse.scala`: `def parse(line: String): Play`, `deviceLabel`, `isCounted` | a frame pushed, popped |
| 5 | ◆ full scene: the JVM memory model | concept + lab (the real frames from `getStackTrace`; a million plays measured) | stack frames → heap objects; one `Play`'s real size beside it |
| 6 | Functions as values | `today.filter(isCounted)`, `_.msPlayed >= 30_000`, `map(_.trackId)` | a function passed into `filter` |
| 7 | Exceptions | the export, a triple-quoted String in `Data.scala`; `3x` stops it; `try` per line | the exception travelling up the frames |
| 8 | `Either` | `parse` returns `Either[String, Play]` (a `ParseError` enum replaces the String in 5.8) | two tracks: Right flows on, Left skips |
| 9 | for-comprehensions | parse field after field: field count, number, known track | the `for` ↔ the `flatMap` chain it means |
| 10 | Every bad row, reported | `partitionMap`: good plays and rejections with line numbers | rows tagged ok / rejected with reason |

Course 4 reads its export from a String in `Data.scala`; files arrive in Course 7, which moves it to
`data/plays/`.

**5. `model` · Model the domain · 8**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | `enum` | `Device`: Phone, Web, Car | members; the typo the compiler refuses |
| 2 | ADTs: enums with data | `Event`: Play, Skip, Like | each case with its own fields |
| 3 | Exhaustiveness | add `Skip`; the compiler lists the unhandled matches | the match, the missing case lit |
| 4 | Opaque types | `TrackId`, `UserId`, `Millis`: mixing refused at compile time | one type at compile time, a plain `String` at run time (`javap`) |
| 5 | Companion objects and smart constructors | `case class Play private`; `Play.from(…, -3000, …)` → `Left` (durations stay `Long`, so later courses add them freely) | construction → accepted / rejected |
| 6 | Traits | `Timed` shared by `Play` and `Skip` | one trait, two cases |
| 7 | Extension methods | `ms.toMinutes`, `play.isCounted` | a method attached from outside |
| 8 | Errors as an `enum` | `ParseError`: BadNumber, UnknownTrack, NegativeDuration… | the error cases, each with its report line |

**6. `transform` · Transform it · 8**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | `map`, `filter`, `flatMap` | counted plays only | the pipeline of stages |
| 2 | `groupBy` and `groupMapReduce` | plays per track | rows dropping into buckets |
| 3 | Sorting and top-N | the daily chart, top 10 | plot: plays by track, sorted |
| 4 | `foldLeft` | listening minutes per user, by hand | the accumulator through the rows |
| 5 | Dates and times | `java.time`; a day in the listener's zone | timeline: one play, two calendar days |
| 6 | Duplicates | the retried upload: `distinctBy(_.eventId)` | duplicates struck through |
| 7 | Sessions | a 30-minute gap starts a new session | plot: one user's plays split into sessions |
| 8 | Iterators and laziness | a file line by line, `getLines`, views | a pull pipeline: nothing runs until consumed |

**7. `save` · Read and write files · 7**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Files and `Using` | read an export; closed on error too | open → read → close, both paths |
| 2 | Writing reports | the chart to `chart.csv` | rows → lines |
| 3 | Partitioned output | `out/date=2026-10-01/chart.csv` | the folder tree, one folder per day |
| 4 | Safe re-runs | write to temp, atomic move; run twice, same files | temp → rename; idempotent |
| 5 | JSON as an ADT | `enum Json`: Null, Bool, Num, Str, Arr, Obj | one upload line as a tree |
| 6 | A parser by hand | recursive descent over a cursor; `@tailrec` | the call tree for one line |
| 7 | From JSON to `Play` | decode → `Either`; the truncated line reported with its column | line → Json → Play, the failing branch |

**8. `abstract` · Generic code and type classes · 6**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Generics | `topN[A](xs, n)(by)` for tracks and artists | the type parameter flowing through |
| 2 | Variance | `List[Play]` where `List[Event]` is wanted | `+A`: the subtype arrow carried over |
| 3 | `given` and `using` | an `Ordering` for chart rows | the compiler finds the given |
| 4 | Type classes | `Monoid[A]`: `empty`, `combine`; for counts, minutes, maps | one interface, many instances |
| 5 | One aggregate for everything | `combineAll` gives plays per track, minutes per user | the fold with a monoid |
| 6 | Deriving a codec | `case class ChartRow(…) derives CsvCodec` | case class → `Mirror` → codec |

**9. `trust` · Make it trustworthy · 6**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | munit | the first tests: a good row, a bad row | test → unit → assert |
| 2 | Many cases, one test | every bad row from the table | one test fanned into cases |
| 3 | Property-based testing | ScalaCheck: `combine` is associative | generator → 100 cases → property |
| 4 | A bug found by a property | parse → print → parse fails on the quoted title | the shrunk counter-example |
| 5 | Logging | `System.Logger` instead of `println` | logger → handler → stderr |
| 6 | The compiler as reviewer | `-Werror`, `-Wunused`, `CanEqual` refuses `trackId == userId` | flag → warning → refused build |

**10. `scale` · Ten million plays · 8**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Ten million plays | the seeded generator; the whole file read into a `List` → `OutOfMemoryError` at `-Xmx512m` | plot: heap filling up |
| 2 | ◆ full scene: the heap and the GC | concept + lab (the GC log of that run) | generations, objects per `Play`, the real log beside it |
| 3 | Streaming the file | the `Iterator` pipeline in constant memory | plot: heap flat |
| 4 | Measure first | a timing harness; where the time goes | plot: time per stage |
| 5 | Partitioning: a shuffle by hand | `hash(trackId) % 8` → 8 spill files | rows → partitions |
| 6 | Every core | one `Future` per partition; partial results combined by the `Monoid` | fan out, fan in; why associativity matters |
| 7 | Skew | the viral track: one partition holds 40%; salting | plot: partition sizes, before and after |
| 8 | Sorting more than memory | sessions need plays sorted by user: sorted runs, k-way merge | sorted runs → one merge |

**11. `stream` · Follow it live · 7**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Watching a folder | `WatchService`: a new upload is picked up | folder → event → read |
| 2 | Event time vs arrival time | the offline phone: played Monday, arrived Wednesday | two timelines |
| 3 | Windows | plays per track per hour (tumbling windows) | timeline in bins |
| 4 | Watermarks | a window closes when the watermark passes; a late play goes to the late report | the watermark line across the bins |
| 5 | State as a value | the stream as a fold: `(state, batch) => state` | state → batch → new state |
| 6 | Checkpoints | save offsets and state; `kill -9`; resume | crash and resume on one timeline |
| 7 | Exactly once | dedup + atomic writes: replaying a batch changes nothing | the same batch twice, one result |

**12. `ship` · Ship it · 6**

| # | Section | Step | Side pane |
| --- | --- | --- | --- |
| 1 | Configuration | defaults, a config file, env vars, flags | default ← file ← env ← flag |
| 2 | Subcommands | `playstream ingest`, `chart`, `stream`, `serve` | argv → the command it runs |
| 3 | Packaging | `scala-cli --power package --assembly` → `java -jar playstream.jar` | sources → one jar |
| 4 | Serving the charts | JDK `HttpServer`: `GET /charts/2026-10-01` as JSON (our own encoder) | request → handler → partition → JSON |
| 5 | The finished pipeline | the whole tree | **the app map**, every part on its stage |
| 6 | Where next | sbt for big builds; Spark, Flink, Kafka; Cats Effect and ZIO; Scala Native | each part of `playstream` → its tool at scale |

83 sections: 2 + 6 + 9 + 10 + 8 + 8 + 7 + 6 + 6 + 8 + 7 + 6.

## Decisions

1. App: `playstream`, the data pipeline of a fictional music service. Standalone: the app imports
   only `scala.*` and `java.*` (owner, 2026-11-13).
2. No Spark or other data framework in the story: their ideas (partitions, shuffle, external
   sort, windows, watermarks, checkpoints) are built by hand; frameworks appear only in 12.6.
3. scala-cli for the whole course, from the first script to the assembly jar; sbt appears only in
   12.6. Its `.scala-build/` is the counterpart of Python's `__pycache__`.
4. Scala 3.9.0 (LTS), JDK 25. Scala 3 syntax (indentation) throughout; braces are shown once
   (2.2) so a viewer can read older code.
5. Tests arrive in Course 9 (munit, ScalaCheck), test-only, pinned.
6. The JSON parser is our own (7.5–7.7): the standard library has none, and a recursive ADT with
   a parser is the clearest picture of Scala's strengths.
7. Infra ported from java-bank (toolchain pinning, `spine.py`, IDE frame v2, checks, film) and
   python-expense-tracker (Colab notebook, registry). Course 2 is the pilot; then 1, 3–12, each
   reviewed on its rendered routes before the next. Done for the pilot (2026-11-13): toolchain,
   `spine.py`, frame v2 (v2 only: no v1 template), checks, shots. Not yet: the Colab notebook, the
   audio manifest, `film.mjs`, `thumb-film.mjs` (stages after the courses are approved).
8. The JDK pin is Ubuntu's current build, 25.0.5.0.3 (2026-11-13). The archive keeps only the
   newest build; java-bank's 25.0.4.1 can no longer be installed by its own script.
9. scala-cli is its JVM launcher from Maven Central (`org.virtuslab.scala-cli:cli_3:1.19.0`, 169
   jars resolved by Maven), behind a launcher script that keeps the proxy's `JAVA_TOOL_OPTIONS` out
   of every child JVM. It reports itself exactly as the native launcher does.

## Open

1. **Engine gap (graphl-flow minor), deferred by the owner (2026-11-13)**: 0.11 already has
   `lang: 'scala'`, and its shared keyword set covers Courses 2–4 (`val`, `def`, `object`, `trait`,
   `match`, `case`, `enum`, `then`, `using`). Missing from Course 5 on: `given`, `extension`,
   `opaque`, `derives`, `lazy`, `override`, `inline`; a `.scala` icon in the explorer. REPL lines
   are drawn as output, as java-bank's jshell lines are, so `parsePrompt` needs nothing.
2. **The shell's `graphl-shots-4k`** shoots only the first course (noted in
   typescript-diagram-engine): this repo's `scripts/shots.mjs` is used until it is fixed in ui-shell.
3. **"Play-Stream" as the service's name**: a common phrase; a trademark search before the film
   is published, as java-bank's "Syndica Bank" was checked.
