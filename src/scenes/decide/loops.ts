import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { files, printed } from './shared'
import code from '../../../spine/decide/02-loops/project/Main.scala?raw'
import data from '../../../spine/decide/02-loops/project/Data.scala?raw'
import session from '../../../spine/decide/02-loops/session.txt?raw'

// §2 — for: the body runs once per play, `play` rebound each time; a guard (`if`) skips some. The
// total is one of the course's few vars, and fold replaces it in 6.4.
const out = printed(session)
const plays = [...data.matchAll(/Play\("(e\d+)", "u\d+", "t\d+", "[^"]+", ([\d_]+)/g)].map((m) => [m[1], m[2].replace(/_/g, '')])

export const decideLoops: SceneModel = ideFrame2({
  model: 'for: the body runs once per play',
  tree: files('Main.scala', [], false),
  editor: { file: 'Main.scala', code, highlight: linesFrom(code, 'var total', 'counted: ') },
  session,
  side: [
    {
      type: 'group', id: 'loop', bare: true, dir: 'row', children: [
        { type: 'table', id: 'today', title: 'today', tone: 'ingest', columns: ['play', 'ms'], rows: plays.map(([id, ms]) => ({ id, cells: [id, ms], ...(Number(ms) < 30_000 && { tone: 'neutral' as const }) })) },
        { type: 'group', id: 'bodies', bare: true, children: [
          { type: 'item', id: 'sum', title: 'total += msPlayed', sub: out[0].replace('listened today: ', 'all six: '), icon: 'activity', tone: 'store' },
          { type: 'item', id: 'guard', title: 'if msPlayed >= 30_000', sub: `${out.length - 1} counted, e0006 skipped`, icon: 'filter', tone: 'store' },
        ] },
      ],
    },
    {
      type: 'table', id: 'said', title: 'The terminal', tone: 'store', columns: ['loop', 'gave'], rows: [
        ['for play <- today', out[0].replace('listened today: ', '')],
        ['… if msPlayed >= 30_000', `${out.length - 1} counted lines`],
      ],
    },
  ],
  edges: [
    { from: 'today.e0001', to: 'sum' },
    { from: 'today.e0006', to: 'guard' },
    { from: 'loop', to: 'said' },
  ],
})
