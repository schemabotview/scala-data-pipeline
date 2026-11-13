import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { explorerTree, printed } from '../files'
import t1 from '../../../spine/trust/01-munit/project/test/ParseTest.test.scala?raw'
import s1 from '../../../spine/trust/01-munit/session.txt?raw'
import t2 from '../../../spine/trust/02-cases/project/test/ParseTest.test.scala?raw'
import s2 from '../../../spine/trust/02-cases/session.txt?raw'
import t3 from '../../../spine/trust/03-properties/project/test/MonoidTest.test.scala?raw'
import s3 from '../../../spine/trust/03-properties/session.txt?raw'
import t4 from '../../../spine/trust/04-bug-found/project/test/CsvTest.test.scala?raw'
import s4 from '../../../spine/trust/04-bug-found/session.txt?raw'
import log5 from '../../../spine/trust/05-logging/project/Log.scala?raw'
import s5 from '../../../spine/trust/05-logging/session.txt?raw'
import proj6 from '../../../spine/trust/06-compiler/project/project.scala?raw'
import s6 from '../../../spine/trust/06-compiler/session.txt?raw'
import s6b from '../../../spine/trust/06b-reviewed/session.txt?raw'
import s6c from '../../../spine/trust/06c-unused/session.txt?raw'

// Course 9 — Make it trustworthy: munit, table-driven tests, ScalaCheck properties, a bug found by
// one, logging, and the compiler at its strictest. Every value shown is a session's.
const CODE = ['CsvCodec.scala', 'Data.scala', 'Decode.scala', 'Device.scala', 'Event.scala', 'Ids.scala', 'Io.scala', 'Json.scala', 'JsonParser.scala', 'Main.scala', 'Monoid.scala', 'Parse.scala', 'ParseError.scala', 'Play.scala', 'Rank.scala', 'Rules.scala', 'Timed.scala', 'Transform.scala', 'project.scala', 'data/', 'out/']
const files = (tests: string[], open: string, added: string[] = [], extra: string[] = []) =>
  explorerTree([...CODE, ...extra, ...tests.map((t) => `test/${t}`)], open, added, ['out'])
/** munit's verbose lines, as `+ name` (a passed test) and the totals; timings are this build's. */
const results = (s: string) => printed(s).filter((l) => l.startsWith('  + ') || l.startsWith('Test run') && l.includes('finished'))

const r1 = results(s1)
const munit = ideFrame2({
  model: 'A test: run the unit, assert the result',
  tree: files(['ParseTest.test.scala'], 'test/ParseTest.test.scala', ['test/ParseTest.test.scala']),
  editor: { file: 'test/ParseTest.test.scala', code: t1, highlight: [lineOf(t1, 'test("a good row'), lineOf(t1, 'assertEquals(play.map(_.eventId)'), lineOf(t1, 'test("3x')] },
  session: s1,
  side: [
    {
      type: 'group', id: 'flow', title: 'test("a good row becomes a Play")', icon: 'shield', tone: 'ingest', children: [
        { type: 'item', id: 'unit', title: 'parse("e0001,u01,t03,…")', sub: 'the unit under test', icon: 'code' },
        { type: 'item', id: 'assert', title: 'assertEquals(…, Right("e0001"))', sub: 'obtained, then expected', icon: 'search' },
        { type: 'item', id: 'pass', title: '+ passed', sub: 'a failure would show the diff', icon: 'check', tone: 'store' },
      ],
    },
    { type: 'table', id: 'run', title: 'scala-cli test . -- -v', tone: 'store', rows: r1.map((l) => [l.trim().replace(/ [\d.]+s$/, '').replace('Test run ParseTest finished: ', '')]) },
  ],
  edges: [{ from: 'unit', to: 'assert' }, { from: 'assert', to: 'pass' }],
})

const r2 = results(s2)
const cases = ideFrame2({
  model: 'One table of cases, one test each',
  tree: files(['ParseTest.test.scala'], 'test/ParseTest.test.scala'),
  editor: { file: 'test/ParseTest.test.scala', code: t2, highlight: [lineOf(t2, 'val badRows'), ...linesFrom(t2, 'for (line, expected)', 'assertEquals(parse(line), Left(expected))')], show: [[lineOf(t2, 'val badRows'), lineOf(t2, '-> ParseError.BadNumber')], linesFrom(t2, 'for (line, expected)', 'assertEquals(parse(line), Left(expected))').filter((_, i, a) => i === 0 || i === a.length - 1) as [number, number]] },
  session: s2,
  side: [
    {
      type: 'group', id: 'fan', title: 'for (line, expected) <- badRows', icon: 'layers', tone: 'ingest', children: [
        { type: 'item', id: 'table', title: 'badRows: 4 pairs', sub: 'a line, and the error it must give', icon: 'table' },
        { type: 'item', id: 'tests', title: 'test(s"refuses …")', sub: 'one named test per pair', icon: 'shield', tone: 'store' },
      ],
    },
    { type: 'table', id: 'names', title: 'The five tests', tone: 'store', rows: r2.filter((l) => l.startsWith('  + ')).map((l) => [l.trim().replace(/ [\d.]+s$/, '').replace(/^\+ /, '+ ')]) },
  ],
  edges: [{ from: 'table', to: 'tests', label: 'each pair' }],
})

const r3 = results(s3)
const props = ideFrame2({
  model: 'A property: true for hundreds of random cases',
  tree: files(['MonoidTest.test.scala', 'ParseTest.test.scala'], 'test/MonoidTest.test.scala', ['test/MonoidTest.test.scala']),
  editor: { file: 'test/MonoidTest.test.scala', code: t3, highlight: linesFrom(t3, 'property("combine is associative', '((a |+| b) |+| c)') },
  session: s3,
  side: [
    {
      type: 'group', id: 'gen', title: 'forAll { (a, b, c) => … }', icon: 'zap', tone: 'ingest', children: [
        { type: 'item', id: 'random', title: 'ScalaCheck makes a, b, c', sub: 'random Map[String, Int]s, 100 times', icon: 'boxes' },
        { type: 'item', id: 'law', title: '(a |+| b) |+| c == a |+| (b |+| c)', sub: 'checked for each', icon: 'search' },
        { type: 'item', id: 'held', title: '+ held, every time', sub: 'associative: safe to split', icon: 'check', tone: 'store' },
      ],
    },
    { type: 'table', id: 'laws', title: 'The Monoid laws', tone: 'ingest', columns: ['law', 'means'], rows: [['associative', 'any grouping, one answer'], ['identity', 'empty changes nothing']] },
  ],
  edges: [{ from: 'random', to: 'law' }, { from: 'law', to: 'held' }],
})
void r3

const o4 = s4.split('\n')
const bug = ideFrame2({
  model: 'A property finds the case nobody wrote',
  tree: files(['CsvTest.test.scala', 'MonoidTest.test.scala', 'ParseTest.test.scala'], 'test/CsvTest.test.scala', ['test/CsvTest.test.scala']),
  editor: { file: 'test/CsvTest.test.scala', code: t4, highlight: linesFrom(t4, 'property("a chart row', 'readCsvLine(row) ==') },
  session: s4,
  side: [
    {
      type: 'group', id: 'trip', title: 'A round trip, for any title', icon: 'activity', tone: 'ingest', children: [
        { type: 'item', id: 'write', title: 'toCsv(ChartRow(1, title, …))', sub: 'written: 1,<title>,Mara Quell,10', icon: 'file' },
        { type: 'item', id: 'read', title: 'readCsvLine(row)', sub: 'split at every comma', icon: 'filter' },
        { type: 'item', id: 'fail', title: o4.find((l) => l.startsWith('Falsified'))!, sub: `shrunk to ${o4.find((l) => l.startsWith('> ARG_0:'))!.replace('> ARG_0: ', 'title = ')}`, icon: 'bell', tone: 'consume' },
      ],
    },
    { type: 'table', id: 'why', title: 'title = ","', tone: 'consume', columns: ['', 'cells'], rows: [['written', '1,,,Mara Quell,10'], ['read back', '5 cells, not 4']] },
  ],
  edges: [{ from: 'write', to: 'read' }, { from: 'read', to: 'fail' }],
})

const logged = printed(s5).filter((l) => /^(INFO|WARNING) /.test(l))
const logging = ideFrame2({
  model: 'A logger: what happened, at what level',
  tree: files(['CsvTest.test.scala', 'MonoidTest.test.scala', 'ParseTest.test.scala'], 'Log.scala', ['Log.scala'], ['Log.scala']),
  editor: { file: 'Log.scala', code: log5, highlight: [lineOf(log5, 'val log ='), lineOf(log5, 'def info'), lineOf(log5, 'def warn')] },
  session: s5,
  side: [
    {
      type: 'group', id: 'path', title: 'info(…) and warn(…)', icon: 'log', tone: 'ingest', children: [
        { type: 'item', id: 'logger', title: 'System.getLogger(…)', sub: 'the JDK\'s own: "playstream"', icon: 'log' },
        { type: 'item', id: 'handler', title: 'a handler, a format', sub: 'from project.scala: level, name, text', icon: 'settings' },
        { type: 'item', id: 'stderr', title: 'stderr', sub: 'apart from the program\'s output', icon: 'terminal', tone: 'store' },
      ],
    },
    { type: 'table', id: 'lines', title: 'This run, logged', tone: 'store', rows: logged.map((l) => ({ cells: [l.replace(' playstream:', ':')], tone: l.startsWith('WARNING') ? 'consume' as const : 'store' as const })) },
  ],
  edges: [{ from: 'logger', to: 'handler' }, { from: 'handler', to: 'stderr' }],
})

const found = [
  ...s6b.split('\n').filter((l) => /^\[error\] \.\//.test(l)).map((l, i) => [l.replace('[error] ./', ''), s6b.split('\n').filter((m) => m.includes('cannot be compared'))[i]?.replace('[error] Values of types ', '').replace(' cannot be compared with == or !=', ': ==') ?? '']),
  [s6c.split('\n').find((l) => /^\[error\] \.\//.test(l))!.replace('[error] ./', ''), 'unused import'],
]
const compiler = ideFrame2({
  model: 'The compiler as a reviewer',
  tree: files(['CsvTest.test.scala', 'MonoidTest.test.scala', 'ParseTest.test.scala'], 'project.scala', [], ['Log.scala']),
  editor: { file: 'project.scala', code: proj6, highlight: [lineOf(proj6, 'using options')] },
  session: s6,
  side: [
    {
      type: 'group', id: 'flags', title: 'Three options', icon: 'shield', tone: 'ingest', children: [
        { type: 'item', id: 'werror', title: '-Werror', sub: 'a warning stops the build', icon: 'bell' },
        { type: 'item', id: 'unused', title: '-Wunused:all', sub: 'imports, values, parameters', icon: 'search' },
        { type: 'item', id: 'strict', title: '-language:strictEquality', sub: '== only where CanEqual says', icon: 'lock', tone: 'store' },
      ],
    },
    { type: 'table', id: 'found', title: 'What it found, before the fixes', tone: 'consume', rows: found.map(([at, what]) => [`${at.replace(/:\d+$/, '')}  ${what}`]) },
  ],
  edges: [{ from: 'werror', to: 'unused' }, { from: 'unused', to: 'strict' }],
})

export const trustScenes: Record<string, SceneModel> = {
  'trust-munit': munit,
  'trust-cases': cases,
  'trust-properties': props,
  'trust-bug-found': bug,
  'trust-logging': logging,
  'trust-compiler': compiler,
}
