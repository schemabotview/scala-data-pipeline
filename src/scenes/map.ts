import type { Group, Item, SceneModel, SceneNode } from '@graphlearning/graphl-flow'

// The app map: what playstream is made of, each part tagged with the course that builds it. One
// scene function for every use: 1.2 (nothing built yet), the end of a course (its parts lit), 12.5
// (everything). A part not yet built is drawn muted.
export interface MapPart { id: string; title: string; sub: string; icon: string; course: number; courses?: string }

export const PARTS: MapPart[] = [
  { id: 'm-model', title: 'model', sub: 'Play, Event, ids that can\'t mix', icon: 'card', course: 5 },
  { id: 'm-parse', title: 'parse', sub: 'CSV and our own JSON parser', icon: 'code', course: 7, courses: 'courses 4, 7' },
  { id: 'm-transform', title: 'transform', sub: 'charts, sessions, dedup', icon: 'chart', course: 6 },
  { id: 'm-agg', title: 'agg + codec', sub: 'one Monoid, one derived codec', icon: 'layers', course: 8 },
  { id: 'm-scale', title: 'scale', sub: 'partitions, every core, spills', icon: 'zap', course: 10 },
  { id: 'm-stream', title: 'stream', sub: 'windows, watermarks, checkpoints', icon: 'activity', course: 11 },
]
export const AROUND: MapPart[] = [
  { id: 'a-first', title: 'Main.scala', sub: 'one script, the first count', icon: 'file', course: 2, courses: 'courses 2–4' },
  { id: 'a-trust', title: 'tests', sub: 'munit and ScalaCheck', icon: 'shield', course: 9 },
  { id: 'a-ship', title: 'playstream.jar', sub: 'subcommands, HTTP', icon: 'package', course: 12 },
]

const card = (p: MapPart, built: number): Item =>
  ({ type: 'item', id: p.id, title: `${p.title} · ${p.courses ?? `course ${p.course}`}`, sub: p.sub, icon: p.icon, tone: p.course <= built ? 'store' : 'neutral' })

export function appMap({ title, sub, built, output }: { title: string; sub: string; built: number; output?: SceneNode }): SceneModel {
  const inputs: Group = {
    type: 'group', id: 'inputs', title: 'In', icon: 'users', tone: 'source', children: [
      { type: 'item', id: 'in-web', title: 'data/plays/*.csv', sub: 'the web player\'s exports', icon: 'file' },
      { type: 'item', id: 'in-phones', title: 'data/uploads/*.jsonl', sub: 'the phones\', some late', icon: 'network' },
      { type: 'item', id: 'in-catalog', title: 'data/catalog.csv', sub: 'tracks and artists', icon: 'database' },
    ],
  }
  const pkg: Group = {
    type: 'group', id: 'pkg', title: 'playstream', sub: 'Play-Stream\'s pipeline, in Scala', icon: 'layers', tone: 'ingest', dir: 'grid', cols: 2,
    children: PARTS.map((p) => card(p, built)),
  }
  const outputs: Group = {
    type: 'group', id: 'outputs', title: 'Out', icon: 'screen', tone: 'store', children: output ? [output] : [
      { type: 'item', id: 'out-charts', title: 'daily charts', sub: 'top tracks and artists', icon: 'chart' },
      { type: 'item', id: 'out-reports', title: 'out/date=…/', sub: 'one folder per day', icon: 'folder' },
      { type: 'item', id: 'out-http', title: 'GET /charts/<date>', sub: 'JSON over HTTP', icon: 'globe' },
    ],
  }
  const around: Group = {
    type: 'group', id: 'around', title: built >= 12 ? 'Made professional' : 'Around the code', icon: 'settings', tone: built >= 9 ? 'store' : 'neutral', dir: 'row',
    children: AROUND.map((p) => card(p, built)),
  }
  return {
    title, sub,
    nodes: [{ type: 'group', id: 'flow', bare: true, dir: 'row', children: [inputs, pkg, outputs] }, around],
    edges: [{ from: 'inputs', to: 'pkg', label: 'events' }, { from: 'pkg', to: 'outputs', label: 'results' }],
  }
}
