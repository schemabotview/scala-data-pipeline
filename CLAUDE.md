# CLAUDE.md — scala-data-pipeline

> Workspace invariants live in the workspace `CLAUDE.md`. This file is only what is true here.

## What this repo is

A GraphL concept app: **learn Scala by building a data pipeline**, `playstream` (the listening data
of a fictional music service), from a script that counts three plays to a tested, packaged pipeline
that processes ten million events on every core, follows live uploads and serves its charts over
HTTP, in real, executed code. Standalone: the app imports only `scala.*` and `java.*` (no Spark or
other framework). A **section** is `(scene, narration)`: one full-screen 16:9 frame.

**`COURSE-PLAN.md` is the source of truth** (12 courses, 83 sections). Author from it; change it
first, never drift from it.

Engine `@graphlearning/graphl-flow` 0.11.0, shell `@graphlearning/shell` 1.1.0, pinned exactly; no
overrides. Infra ported from **java-bank** (spine replay, IDE frame v2, checks); port, do not reinvent.

## Status

| # | Course | Sections | Status |
| --- | --- | --- | --- |
| 1 | `intro` | 2 | authored (1.2 shows the finished jar's real HTTP answers, from 12.4) |
| 2 | `start` | 6 | authored (pilot, approved by the owner 2026-11-13) |
| 3 | `hold` | 9 | authored |
| 4 | `decide` | 10 | authored |
| 5 | `model` | 8 | authored |
| 6 | `transform` | 8 | authored |
| 7 | `save` | 7 | authored |
| 8 | `abstract` | 6 | authored |
| 9 | `trust` | 6 | authored |
| 10 | `scale` | 8 | authored (10M plays; replays take ~5 min) |
| 11 | `stream` | 7 | authored |
| 12 | `ship` | 6 | authored |

All 83 sections authored 2026-11-13: every spine step replayed, `npm run check` clean at 4K, every
frame looked at. Audio: all 83 wavs in (Colab). Recorded 2026-11-15: all 12 courses at 3840×2160
(`record:all`, 2.4 s loop, 134 min in total), in `scripts/out/`. Film built (`npm run film`, from
java-bank): `scripts/out/film.mp4` 2:14:20, 83 chapters in `film.txt`. Next: `thumb:film` (java-bank's
is Java-specific: needs a Scala cover), then `gen:desc` and the publish kit.

## Toolchain: OpenJDK 25.0.5.0.3, scala-cli 1.19.0, Scala 3.9.0

`scripts/install-scala.sh` installs it (also usable as the cloud environment's setup script):

- **The JDK** from Ubuntu's archive, pinned to its exact build. The archive keeps only the newest
  build, so a pin goes stale: re-pin here and in `scripts/spine.py` together, then `--write`.
- **scala-cli's JVM launcher** (`org.virtuslab.scala-cli:cli_3`) from Maven Central, resolved with
  Maven into `/usr/local/scala-cli-1.19.0/lib`: github.com is blocked in the cloud environment, so
  the native launcher and `cs setup` are out. The launcher script moves `JAVA_TOOL_OPTIONS` (and
  `SCALA_CLI_JVM_OPTS`) onto its own JVM and out of the environment, so coursier reaches the proxy
  and no child JVM prints "Picked up JAVA_TOOL_OPTIONS".
- **Scala 3.9.0** is pinned by `project.scala` (`//> using scala 3.9.0`); scala-cli's own default is
  3.10.1, and 2.1 shows the pin winning. **Never `//> using jvm`**: it makes scala-cli fetch a JVM
  index from github.com (blocked); the JDK is `JAVA_HOME`.
- Compiles go through scala-cli's Bloop server (`/root/.local/share/scalacli`), shared across steps.

## The spine

`spine/<course>/<NN-step>/` = `project/` + `session.txt` + `step.json`, replayed by
`scripts/spine.py` (`npm run check:spine`; `--write` regenerates; a path prefix filters). Scenes
import them with `?raw`. Every step has exactly one of `first`, `from` + `changes`, or `lab`.
Experiments go in the REPL, never into the app. Paths are normalised to `/home/ana/playstream`.
Highlights are found by text (`lineOf`), never typed as line numbers.

- scala-cli colours its output even on a dumb terminal; the replay strips ANSI.
- `Compiling project (Scala 3.9.0, JVM (25))` / `Compiled project …` are real output and stay. Each
  replay is a fresh copy, so a step that compiles always prints them; a step that runs twice prints
  them once.
- The coursier cache is the machine's (`COURSIER_CACHE`): no step downloads.
- The REPL (`scala-cli repl .`) runs in a pty; its prompt is `scala> `, a blank line between results.
- `.scala-build/`, `.bsp/`, `out/`, `*.class`, `*.tasty` are never compared.

## Frames

IDE frame v2 only (`src/scenes/frame.ts`, from java-bank): one 1344 × 756 grid; compact explorer |
editor over a 72-column terminal sharing 26 rows | side pane 434, TITLED with the section's mental
model, ONE diagram and at most one table outside it, no bullets, no notes, filled ≥ 1/2.
`src/scenes/ide.ts` holds the text helpers (`lineOf`, `trim`, `PROMPT`, `ERROR_START`: scala-cli's
`[error] `, an uncaught exception, the REPL's `-- [E…] … Error:` and exception lines). A side-pane
terminal narrower than 72 columns is hard-wrapped by the scene (2.5's misspelt name). When a
highlight's span does not fit the editor, frame.ts shows a hand-picked `show`, or else the highlighted
lines themselves, folded between and grown to fill (a divergence from java-bank, which throws). In a concept
scene, a long code box takes `wrap: true` and a `w` (2.3's bytecode).

## Engine gaps (graphl-flow)

graphl-flow 0.11 already has `lang: 'scala'`, and its shared keyword set covers most of Scala.
Missing (an engine minor, deliberately not done yet, owner 2026-11-13): `given`, `extension`,
`opaque`, `derives`, `lazy`, `override`, `inline` draw as plain names from Course 5 on; and a
`scala` / `.scala` icon in the tree (`Tree.tsx BY_EXTENSION`).

## Checks, before handing over

```sh
npm run build && npx tsc --noEmit && npm run check   # check-content + check-render (4K)
npm run check:spine
scripts/look.sh <dir> <course or scene>              # 4K shots, 1920×1080 copies: then LOOK
```

## Invariants

- Never write `x`/`y`; scenes are declarative.
- Stylesheets in order: graphl-flow, shell, `./theme.css` last. `--brand` is `#f0605a`, a Scala red
  lifted for contrast (5.3:1 on the dark canvas).
- No `file:` installs committed.
- The app is standard library only; munit and ScalaCheck arrive in Course 9, test-only.
- Narration: `.tts` → `.wav` via Colab + Chatterbox only. Audio at `public/audio/<course>/<id>.wav`.
  `scripts/audio-manifest.json` (`npm run gen:audio`, 83 sections) and the Colab notebook
  (`scripts/colab_generate_audio.ipynb`, `REPO = "scala-data-pipeline"`, `BRANCH = "main"`, ported
  from java-bank) are in; regenerate and commit the manifest after any narration edit.

## Working agreement

Author a whole course (scenes, spine, narration), render it, look, then hand over the routes. No
silent scaffolding. Say what was built, verified and left out.
