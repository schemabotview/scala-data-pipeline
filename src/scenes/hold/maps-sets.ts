import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { ideFrame2 } from '../frame'
import { tree } from '../tree'
import code from '../../../spine/hold/08-maps-sets/project/Main.scala?raw'
import session from '../../../spine/hold/08-maps-sets/session.txt?raw'

// §8 — a Map, the catalog by track id; a Set, the day's listeners, each once. `catalog("t09")`
// would throw; `catalog.get("t09")` is an Option. Every answer is the session's.
const out = session.split('\n').filter((l) => !l.startsWith('$') && !l.startsWith('Compil'))
const catalog = [...code.matchAll(/"(t\d+)" -> "([^"]+)"/g)].map((m) => [m[1], m[2]])
const users = [...code.matchAll(/Play\("e\d+", "(u\d+)"/g)].map((m) => m[1])

export const holdMapsSets: SceneModel = ideFrame2({
  model: 'Map: key → value; Set: each once',
  tree: tree({ 'Main.scala': 'active', 'Play.scala': '', 'project.scala': '' }),
  // The catalog and the lookups; the five plays between them are folded.
  editor: { file: 'Main.scala', code, highlight: [lineOf(code, 'val catalog = Map'), lineOf(code, 'catalog("t03")'), lineOf(code, 'catalog.get'), lineOf(code, 'val listeners = Set')], show: [[lineOf(code, 'val catalog = Map'), lineOf(code, '"t04" ->') + 1], [lineOf(code, 'plays today'), lineOf(code, 'did u04')]] },
  session,
  side: [
    {
      type: 'group', id: 'map', bare: true, dir: 'row', children: [
        { type: 'table', id: 'catalog', title: 'catalog', tone: 'ingest', columns: ['key', 'value'], rows: catalog.map(([k, v]) => ({ id: k, cells: [k, v], ...(k === 't03' && { tone: 'store' as const }) })) },
        { type: 'group', id: 'asks', bare: true, children: [
          { type: 'item', id: 'apply', title: 'catalog("t03")', sub: out[1].replace('t03 is ', '→ '), icon: 'search', tone: 'store' },
          { type: 'item', id: 'get', title: 'catalog.get("t09")', sub: `→ ${out[2].replace('t09 is ', '')}: no such key`, icon: 'search' },
        ] },
      ],
    },
    {
      type: 'table', id: 'set', title: 'Set of the five userIds', tone: 'ingest', columns: ['added', 'the Set'], rows: [
        [users.join(', '), out[3].replace(/^listeners: /, '').replace(/, \d of them$/, '')],
        { cells: ['.size', out[3].match(/(\d) of them/)![1]], tone: 'store' },
      ],
    },
  ],
  edges: [{ from: 'catalog.t03', to: 'apply' }],
})
