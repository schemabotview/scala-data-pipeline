import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { files, printed } from './shared'
import code from '../../../spine/decide/06-functions/project/Main.scala?raw'
import session from '../../../spine/decide/06-functions/session.txt?raw'

// §6 — functions as values: filter takes a function and calls it on every play. A method name, a
// lambda, the `_` shorthand, and a function stored in a val are four ways to write one.
const out = printed(session)

export const decideFunctions: SceneModel = ideFrame2({
  model: 'A function is a value you can pass',
  tree: files('Main.scala'),
  editor: { file: 'Main.scala', code, highlight: linesFrom(code, 'today.filter(isCounted)', 'today.count(isMobile)') },
  session,
  side: [
    {
      type: 'group', id: 'pipe', title: 'filter, then map', icon: 'filter', tone: 'ingest', children: [
        { type: 'item', id: 'p-today', title: 'today', sub: 'six plays', icon: 'layers' },
        { type: 'item', id: 'p-counted', title: 'filter(isCounted)', sub: out[0].replace('counted: ', '') + ' kept', icon: 'filter', tone: 'store' },
        { type: 'item', id: 'p-tracks', title: 'map(_.trackId)', sub: out[2].replace('tracks: ', ''), icon: 'zap', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'forms', title: 'One function, four ways', tone: 'ingest', columns: ['written', 'is'], rows: [
        ['isCounted', 'a method'],
        ['p => p.msPlayed >= …', 'a lambda'],
        ['_.trackId', 'shorthand'],
        ['val isMobile', 'stored in a val'],
      ],
    },
  ],
  edges: [{ from: 'p-today', to: 'p-counted' }, { from: 'p-counted', to: 'p-tracks' }],
})
