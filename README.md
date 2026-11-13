# scala-data-pipeline

**Learn Scala by building a data pipeline.** A GraphL concept app: one application, `playstream`,
the data pipeline of a fictional music service, grows from a script that counts three plays to a
tested, packaged pipeline that processes ten million events on every core, follows live uploads and
serves its charts over HTTP. Standard library only: every data-engineering idea (partitions, a
shuffle, an external sort, windows, watermarks, checkpoints) is built by hand, in real, executed
Scala 3.9 on JDK 25. Scenes render with `@graphlearning/graphl-flow`; the app shell is
`@graphlearning/shell`.

**Status:** all 12 courses (83 sections) authored, replayed and checked at 4K; awaiting review, then audio and recording. Scope, sections and
diagrams are in [`COURSE-PLAN.md`](COURSE-PLAN.md); working notes in [`CLAUDE.md`](CLAUDE.md).

## Run it

```sh
npm install
npm run dev          # http://localhost:5173  ·  routes are #/<course>-<section>, or #/<sceneId>
```

## Verify a change

```sh
scripts/install-scala.sh                              # once: OpenJDK 25 and scala-cli 1.19.0
npm run build && npx tsc --noEmit && npm run check    # check: content + 4K render
npm run check:spine                                   # replays every step on the pinned toolchain
npm run shots -- <course or sceneId>                  # 4K PNGs in out/shots/, then look at them
```

## Layout

```
spine/<course>/<NN-step>/   the app at each step: project/, session.txt (real output), step.json
src/content/<course>/       sections: title, scene id, narration
src/scenes/<course>/        scenes; frame.ts is the IDE frame, ide.ts its text helpers
scripts/                    spine.py, install-scala.sh, check-content, check-render, shots
```
