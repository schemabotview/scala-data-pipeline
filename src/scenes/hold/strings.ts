import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { tree } from '../tree'
import code from '../../../spine/hold/03-strings/project/Main.scala?raw'
import session from '../../../spine/hold/03-strings/session.txt?raw'

// §3 — Strings: one CSV line split at its commas into indexed fields, then put back together with
// the s and f interpolators. The f"%.2f" finally prints 3.57 (2.4 printed 3.566666666666667).
const line = code.match(/"(e0001[^"]*)"/)![1]
const fields = line.split(',')
const out = session.split('\n').filter((l) => !l.startsWith('$') && !l.startsWith('Compil'))

export const holdStrings: SceneModel = ideFrame2({
  model: 'split, index, interpolate',
  tree: tree({ 'Main.scala': 'active', 'project.scala': '' }),
  editor: { file: 'Main.scala', code, highlight: linesFrom(code, 'val line', 'minutes played') },
  session,
  side: [
    {
      type: 'group', id: 'flow', bare: true, dir: 'row', children: [
        { type: 'table', id: 'fields', title: "line.split(',')", tone: 'ingest', columns: ['i', 'fields(i)'], rows: fields.map((f, i) => ({ id: `f${i}`, cells: [i, f.length > 12 ? f.slice(0, 11) + '…' : f], ...([2, 4].includes(i) && { tone: 'store' as const }) })) },
        { type: 'group', id: 'out', bare: true, children: [
          { type: 'item', id: 's-interp', title: 's"track ${fields(2)}"', sub: 'splices in any value', icon: 'code' },
          { type: 'item', id: 'slice', title: '.take(10), .slice(11, 16)', sub: 'a part of a String', icon: 'filter' },
          { type: 'item', id: 'f-interp', title: 'f"${…}%.2f"', sub: 'formats: 3.57', icon: 'code', tone: 'store' },
        ] },
      ],
    },
    {
      type: 'table', id: 'printed', title: 'What lines 6 to 8 print', tone: 'store', rows: out.map((l) => [l]),
    },
  ],
  edges: [
    { from: 'flow', to: 'printed' },
    { from: 'fields.f2', to: 's-interp' },
    { from: 'fields.f3', to: 'slice' },
    { from: 'fields.f4', to: 'f-interp' },
  ],
})
