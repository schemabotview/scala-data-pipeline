import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { ideFrame2 } from '../frame'
import { tree } from '../tree'
import code from '../../../spine/hold/04-case-class/project/Play.scala?raw'
import session from '../../../spine/hold/04-case-class/session.txt?raw'

// §4 — a case class: Play gets named, typed fields and, for free, toString, copy and equality by
// VALUE. The editor shows the new file; the terminal is Main.scala using it.
const out = session.split('\n').filter((l) => !l.startsWith('$') && !l.startsWith('Compil'))

export const holdCaseClass: SceneModel = ideFrame2({
  model: 'A case class: a value with named fields',
  tree: tree({ 'Main.scala': '', 'Play.scala': 'new', 'project.scala': '' }),
  editor: { file: 'Play.scala', code, highlight: [lineOf(code, 'case class Play')] },
  session,
  side: [
    {
      type: 'table', id: 'play', title: 'play', tone: 'ingest', columns: ['field', 'value'], rows: [
        ['eventId', 'e0001'], ['userId', 'u01'], { id: 'track', cells: ['trackId', 't03'], tone: 'store' }, ['startedAt', '2026-10-01T07:…'],
        { id: 'ms', cells: ['msPlayed', '214000'], tone: 'store' }, ['device', 'phone'],
      ],
    },
    {
      type: 'group', id: 'free', title: 'Written for you', icon: 'boxes', tone: 'store', children: [
        { type: 'item', id: 'g-print', title: 'toString', sub: 'Play(e0001,u01,t03,…)', icon: 'screen' },
        { type: 'item', id: 'g-copy', title: 'copy(msPlayed = 30_000)', sub: 'a new Play, one field changed', icon: 'layers' },
        { type: 'item', id: 'g-eq', title: `== another Play: ${out.at(-1)}`, sub: 'equal by value, field by field', icon: 'check' },
      ],
    },
  ],
  edges: [{ from: 'play', to: 'free', label: 'case class' }],
})
