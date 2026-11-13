import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { ideFrame2 } from '../frame'
import { tree } from '../tree'
import code from '../../../spine/hold/06-tuples/project/Main.scala?raw'
import session from '../../../spine/hold/06-tuples/session.txt?raw'

// §6 — tuples: two values carried together with no class. Positional (_1, _2), unpacked with
// `val (track, ms) = pair`, or NAMED (Scala 3.7+): `top.plays`. The names are the compiler's only —
// the session prints (t03,17).
const out = session.split('\n').filter((l) => !l.startsWith('$') && !l.startsWith('Compil'))

export const holdTuples: SceneModel = ideFrame2({
  model: 'A tuple: values together, no class needed',
  tree: tree({ 'Main.scala': 'active', 'Play.scala': '', 'project.scala': '' }),
  editor: { file: 'Main.scala', code, highlight: [lineOf(code, 'val pair'), lineOf(code, 'val (track, ms)'), lineOf(code, 'val top')] },
  session,
  side: [
    {
      type: 'group', id: 'unpack', bare: true, dir: 'row', children: [
        { type: 'table', id: 'pair', title: 'pair', tone: 'ingest', rows: [{ id: 'p1', cells: ['_1', '"t03"'] }, { id: 'p2', cells: ['_2', '214000L'] }] },
        { type: 'group', id: 'names', bare: true, children: [
          { type: 'item', id: 'n-track', title: 'track', sub: 'String', icon: 'key', tone: 'store' },
          { type: 'item', id: 'n-ms', title: 'ms', sub: 'Long', icon: 'key', tone: 'store' },
        ] },
      ],
    },
    {
      type: 'table', id: 'named', title: 'val top = (track = …, plays = 17)', tone: 'ingest', columns: ['', 'shows'], rows: [
        { cells: ['top.plays', '17: by name'], tone: 'store' },
        { cells: ['println(top)', out[3]], tone: 'neutral' },
        ['the names', 'for the compiler'],
      ],
    },
  ],
  edges: [
    { from: 'pair.p1', to: 'n-track', label: 'val (track,' },
    { from: 'pair.p2', to: 'n-ms', label: 'ms) = pair' },
  ],
})
