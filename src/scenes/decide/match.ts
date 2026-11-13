import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { files, printed } from './shared'
import code from '../../../spine/decide/03-match/project/Main.scala?raw'
import session from '../../../spine/decide/03-match/session.txt?raw'

// §3 — match: the device (an Option) is tried against each case IN ORDER; the first that fits
// gives the label. `|` joins two patterns; `Some(other)` binds whatever is inside.
const out = printed(session)

export const decideMatch: SceneModel = ideFrame2({
  model: 'match: the first case that fits',
  tree: files('Main.scala', [], false),
  editor: { file: 'Main.scala', code, highlight: linesFrom(code, 'play.device match', 'case None') },
  session,
  side: [
    {
      type: 'group', id: 'cases', title: 'play.device match: top down', icon: 'branch', tone: 'ingest', children: [
        { type: 'item', id: 'c1', title: 'Some("phone") | Some("car")', sub: '→ "mobile"', icon: 'check', tone: 'store' },
        { type: 'item', id: 'c2', title: 'Some("web")', sub: '→ "browser"', icon: 'check', tone: 'store' },
        { type: 'item', id: 'c3', title: 'Some(other)', sub: '→ any other device, by name', icon: 'check' },
        { type: 'item', id: 'c4', title: 'None', sub: '→ "unknown"', icon: 'archive', tone: 'neutral' },
      ],
    },
    {
      type: 'table', id: 'labels', title: 'The six plays', tone: 'ingest', columns: ['play', 'label'], rows: out.map((l) => l.split(' on ')),
    },
  ],
  edges: [{ from: 'c1', to: 'c2' }, { from: 'c2', to: 'c3' }, { from: 'c3', to: 'c4' }],
})
