import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { files, printed } from './shared'
import code from '../../../spine/decide/08-either/project/Parse.scala?raw'
import session from '../../../spine/decide/08-either/session.txt?raw'

// §8 — Either: parse RETURNS its failure instead of throwing it. Right(play) or Left(why); the
// caller must match on both. split(",", -1) keeps e0002's empty device (4.7's surprise).
const out = printed(session)

export const decideEither: SceneModel = ideFrame2({
  model: 'Either: Right flows on, Left says why',
  tree: files('Parse.scala'),
  editor: { file: 'Parse.scala', code, highlight: linesFrom(code, 'def parse', 'case Some(ms)') },
  session,
  side: [
    {
      type: 'group', id: 'tracks', title: 'parse(line): Either[String, Play]', icon: 'branch', tone: 'ingest', children: [
        { type: 'item', id: 'line', title: 'one line of the export', icon: 'file' },
        { type: 'group', id: 'two', bare: true, dir: 'row', children: [
          { type: 'item', id: 'right', title: 'Right(play)', sub: `${out.filter((l) => l.startsWith('ok')).length} lines`, icon: 'check', tone: 'store' },
          { type: 'item', id: 'left', title: 'Left(problem)', sub: `${out.filter((l) => l.startsWith('skipped')).length} lines, each says why`, icon: 'bell', tone: 'consume' },
        ] },
      ],
    },
    {
      type: 'table', id: 'results', title: 'What run() printed', tone: 'ingest', rows: out.map((l) => ({ cells: [l.replace(', device ', ' · ')], tone: l.startsWith('ok') ? 'store' as const : 'consume' as const })),
    },
  ],
  edges: [{ from: 'line', to: 'right' }, { from: 'line', to: 'left' }],
})
