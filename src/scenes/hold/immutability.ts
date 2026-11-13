import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { tree } from '../tree'
import code from '../../../spine/hold/09-immutability/project/Main.scala?raw'
import session from '../../../spine/hold/09-immutability/session.txt?raw'

// §9 — ◆ side pane: structural sharing. `late :: plays` is a new list whose tail IS plays (the
// session's `eq` says true): nothing was copied, nothing changed. A changed play is a copy.
const out = session.split('\n').filter((l) => !l.startsWith('$') && !l.startsWith('Compil'))

export const holdImmutability: SceneModel = ideFrame2({
  model: 'Nothing changes; new values share the old',
  tree: tree({ 'Main.scala': 'active', 'Play.scala': '', 'project.scala': '' }),
  editor: { file: 'Main.scala', code, highlight: linesFrom(code, 'val late', 'is untouched') },
  session,
  side: [
    {
      type: 'group', id: 'share', bare: true, dir: 'row', children: [
        { type: 'table', id: 'names', title: 'names', tone: 'ingest', rows: [{ id: 'with', cells: ['withLate', '●'] }, { id: 'plays', cells: ['plays', '●'] }] },
        { type: 'group', id: 'cells', bare: true, children: [
          { type: 'item', id: 'c-late', title: 'e0006', sub: 'the one new cell', icon: 'box', tone: 'source' },
          { type: 'item', id: 'c-head', title: 'e0001', sub: 'plays starts here', icon: 'box', tone: 'store' },
          { type: 'item', id: 'c-rest', title: 'e0002 … e0005, Nil', sub: 'shared, not copied', icon: 'layers', tone: 'store' },
        ] },
      ],
    },
    {
      type: 'table', id: 'proof', title: 'The terminal says', tone: 'ingest', columns: ['asked', 'answer'], rows: [
        ['lengths', out[0].replace('plays: ', '').replace(', withLate: ', ' and ')],
        { cells: ['withLate.tail eq plays', out[2].split(': ')[1]], tone: 'store' },
        ['head after copy', out[3].split(' ')[0]],
      ],
    },
  ],
  edges: [
    { from: 'names.with', to: 'c-late' },
    { from: 'names.plays', to: 'c-head' },
    { from: 'c-late', to: 'c-head' },
    { from: 'c-head', to: 'c-rest' },
  ],
})
