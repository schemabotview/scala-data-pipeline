import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { files, printed } from './shared'
import code from '../../../spine/decide/10-every-bad-row/project/Main.scala?raw'
import session from '../../../spine/decide/10-every-bad-row/session.txt?raw'

// §10 — partitionMap: one pass over the lines, each Either sent left or right, two lists out. Every
// rejection carries its line number (the header is line 1). Every row of the table is the session's.
const out = printed(session)
const good = out.filter((l) => /^ {2}e\d/.test(l)).map((l) => l.trim().split(' ')[0])
const bad = out.filter((l) => l.includes('rejected, line')).map((l) => l.replace(/^ *rejected, /, ''))

export const decideEveryBadRow: SceneModel = ideFrame2({
  model: 'partitionMap: two lists, good and bad',
  tree: files('Main.scala'),
  editor: { file: 'Main.scala', code, highlight: linesFrom(code, 'val (bad, good)', '  )') },
  session,
  side: [
    {
      type: 'group', id: 'split', bare: true, dir: 'row', children: [
        { type: 'table', id: 'lines', title: 'the export', tone: 'ingest', columns: ['line', ''], rows: [
          ...good.map((id) => ({ id, cells: [id, 'Right'], tone: 'store' as const })),
          ...bad.map((b, i) => ({ id: `b${i}`, cells: [b.split(':')[0], 'Left'], tone: 'consume' as const })),
        ] },
        { type: 'group', id: 'outs', bare: true, children: [
          { type: 'item', id: 'good', title: `good: ${good.length} plays`, sub: good.join(', '), icon: 'check', tone: 'store' },
          { type: 'item', id: 'bad', title: `bad: ${bad.length} reasons`, sub: 'each with its line number', icon: 'bell', tone: 'consume' },
        ] },
      ],
    },
    {
      type: 'table', id: 'reasons', title: 'Rejected', tone: 'consume', rows: bad.map((b) => [b]),
    },
  ],
  edges: [{ from: `lines.${good[0]}`, to: 'good' }, { from: 'lines.b0', to: 'bad' }],
})
