import type { SceneModel } from '@graphlearning/graphl-flow'
import { linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { files, printed } from './shared'
import code from '../../../spine/decide/07-exceptions/project/Main.scala?raw'
import session from '../../../spine/decide/07-exceptions/session.txt?raw'

// §7 — exceptions: the export (a triple-quoted String in Data.scala) has bad rows; each throws in
// parse, travels up to run's try, and the matching case prints it, so the loop goes on. e0002's
// failure is the surprise: split(',') drops a trailing empty field (4.8 fixes it).
const out = printed(session)

export const decideExceptions: SceneModel = ideFrame2({
  model: 'try catches what a line throws',
  tree: files('Main.scala'),
  editor: { file: 'Main.scala', code, highlight: linesFrom(code, 'try', 'ArrayIndexOutOfBoundsException') },
  session,
  side: [
    {
      type: 'group', id: 'travel', title: 'parse("…,3x,web")', icon: 'bell', tone: 'consume', children: [
        { type: 'item', id: 't-throw', title: 'f(4).toLong throws', sub: 'NumberFormatException, in parse', icon: 'zap', tone: 'consume' },
        { type: 'item', id: 't-catch', title: 'run()\'s try catches it', sub: 'case e: NumberFormatException', icon: 'shield', tone: 'store' },
        { type: 'item', id: 't-next', title: 'the loop goes on', sub: 'the next line is parsed', icon: 'activity' },
      ],
    },
    {
      type: 'table', id: 'results', title: 'Seven lines', tone: 'ingest', rows: out.map((l) => ({ cells: [l.replace(/ for length \d+$/, '…')], tone: l.startsWith('ok') ? 'store' as const : 'consume' as const })),
    },
  ],
  edges: [{ from: 't-throw', to: 't-catch', label: 'up a frame' }, { from: 't-catch', to: 't-next' }],
})
