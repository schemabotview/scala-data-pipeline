import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { ideFrame2 } from '../frame'
import { project } from './tree'
import code from '../../../spine/start/02-main/project/Main.scala?raw'
import session from '../../../spine/start/02-main/session.txt?raw'

// §2 — Main.scala, run with `scala-cli run .`: compile the folder, then call the @main method.
// Line 5 divides two Ints: 214,000 ms of listening is 3.57 minutes, and the program prints 3 —
// the first hint that a value's TYPE decides what happens to it (2.3 shows where the .57 went).
export const startMainScala: SceneModel = ideFrame2({
  model: '@main is where the program starts',
  tree: project('new'),
  editor: { file: 'Main.scala', code, highlight: [lineOf(code, '@main'), lineOf(code, 'minutes')] },
  session,
  side: [
    {
      type: 'group', id: 'run', title: 'scala-cli run .', icon: 'terminal', tone: 'ingest', children: [
        { type: 'item', id: 'run-src', title: 'every .scala file here', sub: 'Main.scala and project.scala', icon: 'file' },
        { type: 'item', id: 'run-compile', title: 'compiled', sub: 'Compiling project (Scala 3.9.0)', icon: 'code' },
        { type: 'item', id: 'run-main', title: 'run() is called', sub: 'the method marked @main', icon: 'cpu' },
      ],
    },
    {
      type: 'table', id: 'lines', title: 'Line by line', tone: 'ingest', columns: ['line', 'what happens'], rows: [
        { id: 'l1', cells: ['1', 'a comment: skipped'] },
        { id: 'l2', cells: ['2', '@main def run(): the start'] },
        { id: 'l3', cells: ['3 – 4', 'print two lines'], tone: 'store' },
        { id: 'l5', cells: ['5', 'prints minutes played: 3'], tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'div', title: 'Line 5 divides two Ints', tone: 'store', columns: ['value', 'type', 'is'], rows: [
        ['214_000', 'Int', 'ms played'],
        ['60_000', 'Int', 'ms a minute'],
        { id: 'quotient', cells: ['214_000 / 60_000', 'Int', '3, not 3.57'], tone: 'consume' },
      ],
    },
  ],
  edges: [
    { from: 'run-src', to: 'run-compile' },
    { from: 'run-compile', to: 'run-main' },
    { from: 'run', to: 'lines' },
  ],
})
