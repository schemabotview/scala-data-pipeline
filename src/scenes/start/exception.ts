import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { ideFrame2 } from '../frame'
import { project } from './tree'
import code from '../../../spine/start/06-exception/project/Main.scala?raw'
import session from '../../../spine/start/06-exception/session.txt?raw'

// §6 — an exception: "3x".toInt is a String's method returning an Int, so the file compiles; it
// fails only when line 4 RUNS, after line 3 has printed. The trace's lines are the session's.
const at = (text: string) => session.split('\n').find((l) => l.includes(text))!.trim()

export const startException: SceneModel = ideFrame2({
  model: 'An exception stops a running program',
  tree: project('active'),
  editor: { file: 'Main.scala', code, highlight: [lineOf(code, '"3x"')] },
  session,
  side: [
    {
      type: 'table', id: 'ran', title: 'This time, it compiles and runs', tone: 'ingest', columns: ['line', 'what happened'], rows: [
        { id: 'r3', cells: ['3', 'printed playstream'], tone: 'store' },
        { id: 'r4', cells: ['4', 'threw an exception'], tone: 'consume' },
        { id: 'r5', cells: ['5 – 6', 'never ran'] },
      ],
    },
    {
      type: 'group', id: 'trace', title: 'Reading the stack trace', icon: 'search', tone: 'consume', children: [
        { type: 'item', id: 's-thread', title: 'Exception in thread "main"', sub: 'the thread that runs run()', icon: 'cpu' },
        { type: 'item', id: 's-type', title: 'NumberFormatException', sub: 'For input string: "3x"', icon: 'bell' },
        { type: 'item', id: 's-at', title: at('Main.scala:4').match(/\((.+)\)/)![1], sub: `${at('Main.scala:4').match(/^at (\S+)\(/)![1]}: our line`, icon: 'file' },
      ],
    },
    {
      type: 'table', id: 'two', title: 'Two kinds of mistake', tone: 'ingest', columns: ['', 'compile error', 'exception'], rows: [
        ['found by', 'the compiler', 'the JVM'],
        ['found', 'before run()', 'at the line'],
        ['lines before', 'never ran', 'already ran'],
      ],
    },
  ],
  edges: [
    { from: 'ran', to: 'trace' },
    { from: 's-thread', to: 's-type' },
    { from: 's-type', to: 's-at' },
  ],
})
