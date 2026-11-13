import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { ideFrame2 } from '../frame'
import { project } from './tree'
import code from '../../../spine/start/05-compile-error/project/Main.scala?raw'
import session from '../../../spine/start/05-compile-error/session.txt?raw'
import notFound from '../../../spine/start/05b-not-found/session.txt?raw'

// §5 — a compile error: the compiler checks every TYPE in the folder before any of it runs, so
// line 3, which is fine, never prints. The other everyday one, a misspelt name, is 05b's real output
// (cut to its error rows: the Compiling line is the same in both).
// A terminal as narrow as the side pane wraps a long row as a real one does: cut at OTHER_COLS.
const OTHER_COLS = 38
const other = notFound.split('\n').filter((l) => l.startsWith('[error]'))
  .flatMap((l) => l.match(new RegExp(`.{1,${OTHER_COLS}}`, 'g'))!).map((row) => `! ${row}`).join('\n')

export const startCompileError: SceneModel = ideFrame2({
  model: 'The compiler checks every type first',
  tree: project('active'),
  editor: { file: 'Main.scala', code, highlight: [lineOf(code, 'val plays')] },
  session,
  side: [
    {
      type: 'group', id: 'check', title: 'Before anything runs', icon: 'search', tone: 'ingest', children: [
        { type: 'item', id: 'c-file', title: 'Main.scala, the whole file', icon: 'file' },
        { type: 'item', id: 'c-types', title: 'every type checked', sub: 'line 4: Int declared, String given', icon: 'search' },
        { type: 'item', id: 'c-error', title: 'Compilation failed', sub: 'no bytecode, so no line runs', icon: 'bell', tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'anatomy', title: 'Reading the error', tone: 'consume', columns: ['the terminal says', 'meaning'], rows: [
        ['./Main.scala:4:20', 'line 4, column 20'],
        ['Found: ("3" : String)', 'what it is'],
        ['Required: Int', 'what was declared'],
        ['^^^ under "3"', 'the spot'],
      ],
    },
    { type: 'code', id: 'not-found', terminal: true, filename: 'the other one: a misspelt name', code: other },
  ],
  edges: [
    { from: 'c-file', to: 'c-types' },
    { from: 'c-types', to: 'c-error' },
  ],
})
