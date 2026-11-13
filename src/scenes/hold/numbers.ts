import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { ideFrame2 } from '../frame'
import { tree } from '../tree'
import code from '../../../spine/hold/02-numbers/project/Main.scala?raw'
import session from '../../../spine/hold/02-numbers/session.txt?raw'

// §2 — Int is 32 bits, Long 64: twelve thousand listeners × 214,000 ms passes Int's largest value
// and WRAPS, silently, to a negative number. One L makes it a Long. Values are the session's.
const answer = (typed: string) => {
  const lines = session.split('\n')
  return lines[lines.indexOf(`scala> ${typed}`) + 1].replace(/^val res\d+: /, '')
}

export const holdNumbers: SceneModel = ideFrame2({
  model: 'Int is 32 bits; Long is 64',
  tree: tree({ 'Main.scala': 'active', 'project.scala': '' }),
  editor: { file: 'Main.scala', code, highlight: [lineOf(code, 'msPlayed: Long'), lineOf(code, 'listeners * msPlayed')] },
  session,
  side: [
    {
      type: 'group', id: 'wrap', title: '12_000 * 214_000', icon: 'gauge', tone: 'consume', children: [
        { type: 'item', id: 'w-true', title: '2,568,000,000', sub: 'the true answer', icon: 'check' },
        { type: 'item', id: 'w-max', title: 'Int holds up to 2,147,483,647', sub: '32 bits: 2³¹ − 1', icon: 'boxes' },
        { type: 'item', id: 'w-neg', title: '−1,726,967,296', sub: 'it wraps around: no error', icon: 'bell', tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'repl', title: 'Asked at scala>', tone: 'ingest', columns: ['typed', 'type = value'], rows: [
        { cells: ['12_000 * 214_000', answer('12_000 * 214_000')], tone: 'consume' },
        { cells: ['12_000 * 214_000L', answer('12_000 * 214_000L')], tone: 'store' },
      ],
    },
  ],
  edges: [
    { from: 'w-true', to: 'w-max', label: 'too big for' },
    { from: 'w-max', to: 'w-neg' },
    { from: 'wrap', to: 'repl' },
  ],
})
