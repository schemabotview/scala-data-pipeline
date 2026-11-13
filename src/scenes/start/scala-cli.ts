import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { ideFrame2 } from '../frame'
import { project } from './tree'
import code from '../../../spine/start/01-scala-cli/project/project.scala?raw'
import session from '../../../spine/start/01-scala-cli/session.txt?raw'

// §1 — scala-cli and the first file, project.scala: one directive pins Scala 3.9.0, the LTS. The
// session asks the toolchain who it is; `compile .` then compiles with the PIN (3.9.0), not the
// launcher's default (3.10.1). Every answer in the table is the session's.
const version = (prefix: string) => session.split('\n').find((l) => l.startsWith(prefix))!.slice(prefix.length)

export const startScalaCli: SceneModel = ideFrame2({
  model: 'scala-cli compiles; the JDK runs',
  tree: project('none', 'new'),
  editor: { file: 'project.scala', code, highlight: [lineOf(code, 'using scala')] },
  session,
  side: [
    {
      type: 'group', id: 'chain', title: 'One command, three parts', icon: 'layers', tone: 'ingest', children: [
        { type: 'item', id: 'cli', title: 'scala-cli', sub: 'compile, run, the REPL, package', icon: 'terminal' },
        { type: 'item', id: 'scala', title: 'Scala 3.9.0', sub: 'compiler and library, pinned', icon: 'package', tone: 'store' },
        { type: 'item', id: 'jdk', title: 'JDK 25', sub: 'the JVM runs what was compiled', icon: 'cpu', tone: 'source' },
      ],
    },
    {
      type: 'table', id: 'asked', title: 'Asked in the terminal', tone: 'ingest', columns: ['asked', 'answer'], rows: [
        ['ls', 'project.scala'],
        { cells: ['java --version', version('openjdk ').split(' ')[0]], tone: 'source' },
        ['scala-cli version', version('Scala CLI version: ')],
        { cells: ['default Scala', version('Scala version (default): ')], tone: 'neutral' },
        { id: 'pinned', cells: ['compile .', 'Scala 3.9.0: the pin'], tone: 'store' },
      ],
    },
  ],
  edges: [
    { from: 'cli', to: 'scala', label: 'fetches once' },
    { from: 'scala', to: 'jdk', label: 'runs on' },
    { from: 'chain', to: 'asked' },
  ],
})
