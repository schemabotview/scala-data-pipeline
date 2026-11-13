import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { ideFrame2 } from '../frame'
import { project } from './tree'
import code from '../../../spine/start/04-repl/project/Main.scala?raw'
import session from '../../../spine/start/04-repl/session.txt?raw'

// §4 — the REPL beside the editor: try the division both ways, see each value WITH its type, then
// write the one that keeps the fraction into line 5. Every answer in the table is the session's.
// `val res0: Int = 3` is cut into its type and its value, so the row fits the pane.
const answer = (typed: string) => {
  const lines = session.split('\n')
  const [, type, value] = lines[lines.indexOf(`scala> ${typed}`) + 1].match(/^val res\d+: (\w+) = (.+)$/)!
  return [type, value]
}

export const startRepl: SceneModel = ideFrame2({
  model: 'The REPL prints the value and its type',
  tree: project('active'),
  editor: { file: 'Main.scala', code, highlight: [lineOf(code, 'minutes')] },
  session,
  side: [
    {
      type: 'group', id: 'loop', title: 'scala-cli repl .', icon: 'terminal', tone: 'ingest', children: [
        { type: 'item', id: 'read', title: 'Read', sub: 'the line you type', icon: 'file' },
        { type: 'item', id: 'eval', title: 'Evaluate', sub: 'compiled and run at once', icon: 'cpu' },
        { type: 'item', id: 'print', title: 'Print', sub: 'res0, its type, its value', icon: 'screen' },
      ],
    },
    {
      type: 'table', id: 'typed', title: 'Typed at scala>', tone: 'ingest', columns: ['214_000 /', 'type', 'value'], rows: [
        { id: 'ints', cells: ['60_000', ...answer('214_000 / 60_000')], tone: 'consume' },
        { id: 'double', cells: ['60_000.0', ...answer('214_000 / 60_000.0')], tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'versus', title: 'The REPL and the file', tone: 'ingest', columns: ['', 'REPL', 'Main.scala'], rows: [
        ['runs', 'a line', 'run()'],
        ['shows', 'every value', 'what it prints'],
        ['keeps', 'nothing', 'every line'],
        ['for', 'trying', 'the pipeline'],
      ],
    },
  ],
  edges: [
    { from: 'read', to: 'eval' },
    { from: 'eval', to: 'print' },
    { from: 'loop', to: 'typed' },
  ],
})
