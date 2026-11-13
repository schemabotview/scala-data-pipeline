import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { ideFrame2 } from '../frame'
import { files } from './shared'
import code from '../../../spine/decide/04-methods/project/Parse.scala?raw'
import session from '../../../spine/decide/04-methods/session.txt?raw'

// §4 — ◆ side pane: the call stack. Three methods move to Parse.scala; each call pushes a frame
// holding its parameters, and returning pops it. 4.5 shows the real frames.
export const decideMethods: SceneModel = ideFrame2({
  model: 'A call pushes a frame; return pops it',
  tree: files('Parse.scala', ['Parse.scala']),
  editor: { file: 'Parse.scala', code, highlight: [lineOf(code, 'def parse'), lineOf(code, 'def deviceLabel'), lineOf(code, 'def isCounted')] },
  session,
  side: [
    {
      type: 'group', id: 'stack', title: 'The stack, inside parse', icon: 'layers', tone: 'ingest', children: [
        { type: 'item', id: 'f-parse', title: 'parse(line)', sub: 'line = "e0007,u03,t05,…"; f', icon: 'box', tone: 'source' },
        { type: 'item', id: 'f-run', title: 'run()', sub: 'waits for parse to return', icon: 'box' },
        { type: 'item', id: 'f-main', title: 'main(args)', sub: 'the compiler\'s, from 2.3', icon: 'box', tone: 'neutral' },
      ],
    },
    {
      type: 'table', id: 'sigs', title: 'Parse.scala', tone: 'ingest', columns: ['method', 'takes', 'gives'], rows: [
        ['parse', 'String', 'Play'],
        ['deviceLabel', 'Option[String]', 'String'],
        ['isCounted', 'Play', 'Boolean'],
      ],
    },
  ],
  edges: [{ from: 'f-main', to: 'f-run', label: 'calls' }, { from: 'f-run', to: 'f-parse', label: 'calls' }],
})
