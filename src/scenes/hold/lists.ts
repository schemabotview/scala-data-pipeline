import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { tree } from '../tree'
import code from '../../../spine/hold/07-lists/project/Main.scala?raw'
import session from '../../../spine/hold/07-lists/session.txt?raw'

// §7 — a day of plays as a List: linked cells, each a value and the rest. Fast at the head, a walk
// to the n-th. A Vector (a shallow tree) reaches any index in a few steps. Ids are the code's.
const ids = [...code.matchAll(/Play\("(e\d+)"/g)].map((m) => m[1])
void session

export const holdLists: SceneModel = ideFrame2({
  model: 'List: linked cells; Vector: indexed',
  tree: tree({ 'Main.scala': 'active', 'Play.scala': '', 'project.scala': '' }),
  editor: { file: 'Main.scala', code, highlight: linesFrom(code, 'println(s"plays today', 'byIndex(4)') },
  session,
  side: [
    {
      type: 'group', id: 'cells', title: 'plays: a List[Play]', icon: 'layers', tone: 'ingest', children: [
        { type: 'item', id: 'c0', title: `${ids[0]} · head`, sub: 'and the rest →', icon: 'box', tone: 'store' },
        { type: 'item', id: 'c1', title: ids[1], sub: 'and the rest →', icon: 'box' },
        { type: 'item', id: 'c2', title: `${ids[2]} · plays(2)`, sub: 'two steps from the head', icon: 'box' },
        { type: 'item', id: 'c-end', title: `${ids[3]}, ${ids[4]}, then Nil`, sub: 'the empty list ends it', icon: 'archive' },
      ],
    },
    {
      type: 'table', id: 'cost', title: 'Reaching a play', tone: 'ingest', columns: ['', 'List', 'Vector'], rows: [
        ['.head', '1 step', 'a few'],
        ['(4)', 'walk 4', 'a few'],
        ['add in front', '1 step', 'a few'],
      ],
    },
  ],
  edges: [{ from: 'c0', to: 'c1' }, { from: 'c1', to: 'c2' }, { from: 'c2', to: 'c-end' }],
})
