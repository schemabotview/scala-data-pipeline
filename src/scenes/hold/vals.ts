import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { tree } from '../tree'
import code from '../../../spine/hold/01-vals/project/Main.scala?raw'
import session from '../../../spine/hold/01-vals/session.txt?raw'

// §1 — val and var: a val names a value for good, a var can be pointed at a new one. The REPL shows
// the inferred type and refuses the reassignment (the session's E052).
const said = (prefix: string) => session.split('\n').find((l) => l.includes(prefix))!.replace(/^\s*\|/, '')

export const holdVals: SceneModel = ideFrame2({
  model: 'val is fixed; var can change',
  tree: tree({ 'Main.scala': 'active', 'project.scala': '' }),
  editor: { file: 'Main.scala', code, highlight: linesFrom(code, 'val trackId', 'plays = plays + 1') },
  session,
  side: [
    {
      type: 'group', id: 'mem', bare: true, dir: 'row', children: [
        { type: 'table', id: 'names', title: 'names', tone: 'ingest', rows: [
          { id: 'track', cells: ['trackId', '●'] }, { id: 'ms', cells: ['msPlayed', '●'] }, { id: 'plays', cells: ['plays', '●'] },
        ] },
        { type: 'group', id: 'values', bare: true, children: [
          { type: 'item', id: 'v-track', title: '"t03"', sub: 'String · val', icon: 'lock', tone: 'store' },
          { type: 'item', id: 'v-ms', title: '214000', sub: 'Int · val', icon: 'lock', tone: 'store' },
          { type: 'item', id: 'v-plays', title: '2', sub: 'Int · var: 0, 1, then 2', icon: 'zap', tone: 'source' },
        ] },
      ],
    },
    {
      type: 'table', id: 'repl', title: 'The REPL answered', tone: 'ingest', rows: [
        { cells: [said('val trackId:').trim()], tone: 'store' },
        { cells: [said('Reassignment').trim()], tone: 'consume' },
      ],
    },
  ],
  edges: [
    { from: 'names.track', to: 'v-track' },
    { from: 'names.ms', to: 'v-ms' },
    { from: 'names.plays', to: 'v-plays' },
  ],
})
