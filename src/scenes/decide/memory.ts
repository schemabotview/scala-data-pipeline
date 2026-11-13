import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { outputOf } from '../lab'
import code from '../../../spine/decide/05-memory/project/Memory.scala?raw'
import session from '../../../spine/decide/05-memory/session.txt?raw'

// §5 — ◆ full scene: the JVM memory model. The STACK is the real frames getStackTrace printed
// inside parse; the HEAP is the Play it built, its fields pointing at shared objects; the size is a
// million copies measured (a volatile step: the number is this build's, read from the session).
const out = outputOf(session, 'scala-cli run .').split('\n').filter((l) => !l.startsWith('Compil'))
const frames = out.filter((l) => l.startsWith('frame: ')).map((l) => l.replace('frame: ', '').split(', line '))
const measured = out.find((l) => l.includes('bytes each'))!

export const decideMemory: SceneModel = {
  title: 'Where a play lives: the stack and the heap',
  sub: 'every running method has a frame on the stack; every object lives on the heap, reached by reference',
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'source', badge: 1, title: 'Memory.scala', sub: 'the lab', icon: 'file', tone: 'ingest', children: [
        { type: 'code', id: 'src', filename: 'Memory.scala', lang: 'scala', code, show: [[lineOf(code, 'def parse'), lineOf(code, 'val play =')]], highlight: [lineOf(code, 'getStackTrace')] },
      ],
    },
    {
      type: 'group', id: 'stack', badge: 2, title: 'The stack', sub: 'printed from inside parse', icon: 'layers', tone: 'source', children: [
        { type: 'table', id: 'frames', columns: ['frame', 'at line'], rows: frames.map(([name, line], i) => ({ id: `fr${i}`, cells: [name, line], ...(i === 0 && { tone: 'source' as const }) })) },
        { type: 'note', id: 'stack-note', text: 'One frame per running method: its parameters and local names. Popped on return.' },
      ],
    },
    {
      type: 'group', id: 'heap', badge: 3, title: 'The heap', sub: 'the Play that parse returned', icon: 'database', tone: 'store', children: [
        { type: 'table', id: 'obj', title: 'Play', columns: ['field', 'holds'], rows: [
          ['eventId', '→ String "e0001"'], ['userId', '→ String "u01"'], ['trackId', '→ String "t03"'], ['startedAt', '→ String'],
          { cells: ['msPlayed', '214000, in place'], tone: 'store' }, ['device', '→ Some → "phone"'],
        ] },
        { type: 'table', id: 'size', title: 'Measured', rows: [{ cells: [measured], tone: 'store' }] },
      ],
    },
  ],
  edges: [{ from: 'source', to: 'stack', label: 'runs' }, { from: 'stack', to: 'heap', label: 'refers to' }],
}
