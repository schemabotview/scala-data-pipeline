import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { files, printed } from './shared'
import code from '../../../spine/decide/09-for-comprehensions/project/Parse.scala?raw'
import session from '../../../spine/decide/09-for-comprehensions/session.txt?raw'

// §9 — a for-comprehension over Either: each `<-` step runs only if the one before was Right; the
// first Left ends it. A new rule, a known track, takes one line, and t99 is now refused.
const out = printed(session)

export const decideForComprehensions: SceneModel = ideFrame2({
  model: 'for over Either: stop at the first Left',
  tree: files('Parse.scala'),
  editor: { file: 'Parse.scala', code, highlight: linesFrom(code, 'for', 'yield') },
  session,
  side: [
    {
      type: 'group', id: 'steps', title: 'Each <- needs a Right', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 's1', title: '6 fields?', sub: 'else Left("4 fields, not 6")', icon: 'search' },
        { type: 'item', id: 's2', title: 'ms a number?', sub: 'else Left("not a number: 3x")', icon: 'search' },
        { type: 'item', id: 's3', title: 'a known track?', sub: 'else Left("unknown track: t99")', icon: 'search' },
        { type: 'item', id: 's4', title: 'yield Play(…)', sub: 'Right(play)', icon: 'check', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'results', title: 'Now', tone: 'ingest', rows: out.filter((l) => l.startsWith('skipped')).map((l) => ({ cells: [l], tone: 'consume' as const })),
    },
  ],
  edges: [{ from: 's1', to: 's2', label: 'Right' }, { from: 's2', to: 's3', label: 'Right' }, { from: 's3', to: 's4', label: 'Right' }],
})
