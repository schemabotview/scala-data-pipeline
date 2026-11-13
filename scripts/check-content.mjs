// Content guard — silent failures that build green and break only on screen or in the recording.
// It reads the REAL registries (scripts/registry.mjs bundles src/content and src/scenes), so it sees
// exactly what renders:
//
//   1. A section must be scene-only and narrated, and its scene must exist.
//   2. Node ids are unique within a scene (graphl-flow resolves edges and focus by id), and no table
//      is empty (one built from a session that was never replayed draws a bare header).
//   3. An IDE side pane (frame v2) is ONE diagram: edges or a plot, at most one table outside it,
//      never a bullet list or a note (python-ct's v1 panes were 79 bullet lists and one edge in 90
//      sections). The editor and terminal are held to their rows by frame.ts itself, which throws.
//   4. An IDE frame draws edges only INSIDE its side pane: an edge between panes widens the gap it
//      crosses (graphl-flow's EDGE_GAP) and moves every pane off the shared template.
//   5. Once a course has narration audio, every section of it has its wav — a missing or renamed one
//      plays silence and records a silent segment, with no error anywhere.
//
// What renders is checked by scripts/check-render.mjs: focus landing, overflow, edges, fit, panes.
//
// Run: npm run check
import { existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { isIde, loadRegistry, nodesOf } from './registry.mjs'

const { COURSES, SCENES } = await loadRegistry()
const problems = []

// --- 1. sections --------------------------------------------------------------------------------
for (const course of Object.values(COURSES))
  for (const section of course.sections) {
    const at = `${course.id}-${section.id}`
    if ('slide' in section) problems.push(`${at}  has a slide — sections in this repo are scene-only`)
    if (!section.narration?.trim()) problems.push(`${at}  has no narration`)
    if (!SCENES[section.scene]) problems.push(`${at}  scene '${section.scene}' is not registered`)
  }

for (const [id, scene] of Object.entries(SCENES)) {
  const all = nodesOf(scene)
  // --- 2. unique ids ----------------------------------------------------------------------------
  const seen = new Set()
  for (const { node } of all) {
    if (seen.has(node.id)) problems.push(`scene ${id}  node id '${node.id}' is used twice`)
    seen.add(node.id)
  }
  // --- 2b. no empty tables ------------------------------------------------------------------------
  // A table built from a session (rows parsed out of real output) renders as a bare header when the
  // session has no output — the build-dependencies frame did, after its steps were regenerated and
  // not replayed, and every render check passed.
  for (const { node } of all)
    if (node.type === 'table' && !(node.rows ?? []).length) problems.push(`scene ${id}  table '${node.id}' has no rows — is its session replayed?`)
  if (!isIde(scene)) continue
  const top = new Map(all.map(({ node, top }) => [node.id, top]))
  const side = all.filter(({ top }) => top === 'side').map(({ node }) => node)
  // An endpoint is a node id or `<table>.<row>` / `<code>.L<n>` / `<tree>.<path>`: its node is the
  // part before the first dot.
  const paneOf = (end) => top.get(end.split('.')[0])
  // --- 4. edges stay inside the side pane --------------------------------------------------------
  const edges = scene.edges ?? []
  for (const e of edges)
    for (const end of [e.from, e.to])
      if (paneOf(end) !== 'side') problems.push(`scene ${id}  edge ${e.from} → ${e.to}: '${end}' is ${paneOf(end) ? `in the ${paneOf(end)} pane` : 'not a node'} — IDE edges stay inside the side pane`)
  // --- 3. the side pane is a diagram ---------------------------------------------------------------
  const sideEdges = edges.filter((e) => paneOf(e.from) === 'side' && paneOf(e.to) === 'side')
  // Frame v2 (src/scenes/frame.ts, workbench id `ide-bench`): the side pane is titled with the mental
  // model and holds ONE diagram (edges or a plot) and at most one table, never a bullet list or a
  // note. Its editor and terminal are held to their rows by frame.ts itself, which throws.
  const tables = side.filter((n) => n.type === 'table')
  if (!sideEdges.length && !side.some((n) => n.type === 'plot')) problems.push(`scene ${id}  the side pane has no diagram (no edge, no plot): a table alone is not the mental model`)
  const loose = tables.filter((t) => !sideEdges.some((e) => [e.from, e.to].some((end) => end.split('.')[0] === t.id)))
  if (loose.length > 1) problems.push(`scene ${id}  the side pane has ${loose.length} tables outside its diagram (${loose.map((t) => t.id).join(', ')}): at most one`)
  for (const n of side) if (n.type === 'item' && n.bullets?.length) problems.push(`scene ${id}  '${n.id}' is a bullet list: draw it, or say it in the narration`)
  for (const n of side) if (n.type === 'note') problems.push(`scene ${id}  '${n.id}' is a note: draw it, or say it in the narration`)
}

// --- 5. every section has its narration wav, once its course has any -----------------------------
// public/audio/<course>/<section-id>.wav. Gated PER COURSE on that course having at least one wav:
// audio is one Colab pass after a course's frames are approved, and reporting a whole course of
// known-missing files on every run trains you to ignore the guard.
const audio = 'public/audio'
for (const course of Object.values(COURSES)) {
  const dir = join(audio, course.id)
  if (!existsSync(dir) || !statSync(dir).isDirectory() || !readdirSync(dir).some((f) => f.endsWith('.wav'))) continue
  for (const section of course.sections) {
    const wav = join(dir, `${section.id}.wav`)
    if (!existsSync(wav)) problems.push(`${course.id}-${section.id}  no narration wav at ${wav} — the section plays silence`)
  }
}

if (problems.length) {
  console.error(`✗ ${problems.length} content problem(s):\n` + problems.map((p) => '  ' + p).join('\n'))
  process.exit(1)
}
const sections = Object.values(COURSES).reduce((n, c) => n + c.sections.length, 0)
console.log(`✓ content OK — ${sections} section(s), ${Object.keys(SCENES).length} scene(s), every IDE side pane a diagram`)
