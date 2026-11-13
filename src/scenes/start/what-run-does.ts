import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, linesFrom } from '../ide'
import { outputOf } from '../lab'
import code from '../../../spine/start/03-what-run-does/project/Main.scala?raw'
import session from '../../../spine/start/03-what-run-does/session.txt?raw'

// §3 — ◆ full scene: what `scala-cli run .` does, taken apart by hand so each stage shows its REAL
// output from the lab: what the typer made of @main, the class and TASTy files, the bytecode, the
// JVM's entry point. A serpentine: compile along the top, run back along the bottom; every arrow
// crosses one gap.
const typer = outputOf(session, 'scala-cli compile . -O -Vprint:typer')
const runClass = linesFrom(typer, 'final class run()', 'scala.util.CommandLineParser.showError')
const generated = typer.split('\n').slice(runClass[0] - 1, runClass.at(-1)! + 3).join('\n')
const files = outputOf(session, 'ls out')
const entry = outputOf(session, 'javap -cp out run')
// javap pads its columns for a terminal 100+ wide; runs of spaces inside a line are closed up (the
// text is javap's, only the padding goes) so the bytecode fits beside the other stages at 24px.
const bytecode = outputOf(session, "javap -c -cp out 'Main$package$'").split('\n').map((l) => l.replace(/(\S) {2,}/g, '$1  ')).join('\n')
const run = linesFrom(bytecode, 'public void run();', '32: return')
const output = outputOf(session, 'scala-cli run .').split('\n').filter((l) => !l.startsWith('Compil')).join('\n')

export const startWhatRunDoes: SceneModel = {
  title: 'What scala-cli run . does',
  sub: 'Scala 3.9.0: compile the folder to bytecode and TASTy, then the JVM runs it',
  nodes: [
    {
      type: 'group', id: 'stages', bare: true, dir: 'grid', cols: 3, children: [
        {
          type: 'group', id: 'source', badge: 1, title: 'Source', sub: 'the text you wrote', icon: 'file', tone: 'ingest', children: [
            { type: 'code', id: 'src', filename: 'Main.scala', lang: 'scala', code, highlight: [lineOf(code, '@main'), lineOf(code, 'minutes')] },
          ],
        },
        {
          type: 'group', id: 'typer', badge: 2, title: 'The compiler adds a class', sub: 'scala-cli compile . -O -Vprint:typer', icon: 'search', tone: 'ingest', children: [
            { type: 'code', id: 'generated', lang: 'scala', code: generated, highlight: [lineOf(generated, 'def main')], wrap: true, w: 560 },
          ],
        },
        {
          type: 'group', id: 'files', badge: 3, title: 'Class files and TASTy', sub: 'scala-cli compile . --compilation-output out', icon: 'layers', tone: 'ingest', children: [
            { type: 'code', id: 'ls', terminal: true, filename: 'terminal', code: `$ ls out\n${files}` },
            { type: 'note', id: 'tasty', text: '.class: bytecode for the JVM. .tasty: the typed tree, for the compiler and tools.' },
          ],
        },
        {
          type: 'group', id: 'output', badge: 6, title: 'Output', sub: 'what println wrote', icon: 'screen', tone: 'store', children: [
            { type: 'code', id: 'out', terminal: true, filename: 'terminal', code: `$ scala-cli run .\n${output}` },
          ],
        },
        {
          type: 'group', id: 'entry', badge: 5, title: 'The JVM starts at main', sub: 'javap -cp out run', icon: 'cpu', tone: 'store', children: [
            { type: 'code', id: 'javap-run', lang: 'text', code: entry, highlight: [lineOf(entry, 'static void main')] },
          ],
        },
        {
          type: 'group', id: 'bytecode', badge: 4, title: 'Bytecode of run()', sub: "javap -c -cp out 'Main$package$'", icon: 'code', tone: 'store', children: [
            { type: 'code', id: 'javap', lang: 'text', code: bytecode, show: [[run[0], run[0]], [lineOf(bytecode, '20: getstatic'), run.at(-1)!]], highlight: [lineOf(bytecode, '23: iconst_3')], wrap: true, w: 560 },
            { type: 'note', id: 'folded', tone: 'consume', text: 'iconst_3: the compiler worked out 214_000 / 60_000 itself. The .57 was gone before the program ran.' },
          ],
        },
      ],
    },
  ],
  edges: [
    { from: 'source', to: 'typer', label: 'type-check' },
    { from: 'typer', to: 'files', label: 'write' },
    { from: 'files', to: 'bytecode', label: 'inside' },
    { from: 'bytecode', to: 'entry', label: 'load' },
    { from: 'entry', to: 'output', label: 'run' },
  ],
}
