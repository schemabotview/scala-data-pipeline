import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { files, printed } from './shared'
import code from '../../../spine/decide/01-expressions/project/Main.scala?raw'
import session from '../../../spine/decide/01-expressions/session.txt?raw'

// §1 — everything is an expression: `if` gives a value, and so does an indented block (its last
// line). The day of plays moved to Data.scala. A play counts toward charts from 30 s.
const out = printed(session)

export const decideExpressions: SceneModel = ideFrame2({
  model: 'Everything is an expression',
  tree: files('Main.scala', ['Data.scala'], false),
  editor: { file: 'Main.scala', code, highlight: [lineOf(code, 'val status'), ...linesFrom(code, 'val minutes', 'f"$m')] },
  session,
  side: [
    {
      type: 'group', id: 'if', title: 'if … then … else: a value', icon: 'branch', tone: 'ingest', children: [
        { type: 'item', id: 'cond', title: 'msPlayed >= 30_000', sub: 'e0001: 214000, so true', icon: 'search' },
        { type: 'group', id: 'arms', bare: true, dir: 'row', children: [
          { type: 'item', id: 'yes', title: '"counted"', sub: 'then: if true', icon: 'check', tone: 'store' },
          { type: 'item', id: 'no', title: '"skipped"', sub: 'else: if false', icon: 'archive', tone: 'neutral' },
        ] },
      ],
    },
    {
      type: 'table', id: 'block', title: 'val minutes = a block', tone: 'ingest', columns: ['line', 'value'], rows: [
        ['val m = … / 60_000.0', '3.5666…'],
        { cells: ['f"$m%.1f minutes"', 'the block\'s value'], tone: 'store' },
        { cells: ['printed', out[2].replace('e0001: ', '')], tone: 'store' },
      ],
    },
  ],
  edges: [
    { from: 'cond', to: 'yes' },
    { from: 'cond', to: 'no' },
  ],
})
