import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { explorerTree, printed } from '../files'
import io1 from '../../../spine/save/01-files/project/Io.scala?raw'
import s1 from '../../../spine/save/01-files/session.txt?raw'
import io2 from '../../../spine/save/02-writing/project/Io.scala?raw'
import s2 from '../../../spine/save/02-writing/session.txt?raw'
import main3 from '../../../spine/save/03-partitions/project/Main.scala?raw'
import s3 from '../../../spine/save/03-partitions/session.txt?raw'
import io4 from '../../../spine/save/04-safe-reruns/project/Io.scala?raw'
import s4 from '../../../spine/save/04-safe-reruns/session.txt?raw'
import json5 from '../../../spine/save/05-json-adt/project/Json.scala?raw'
import s5 from '../../../spine/save/05-json-adt/session.txt?raw'
import parser6 from '../../../spine/save/06-parser/project/JsonParser.scala?raw'
import s6 from '../../../spine/save/06-parser/session.txt?raw'
import decode7 from '../../../spine/save/07-decode/project/Decode.scala?raw'
import s7 from '../../../spine/save/07-decode/session.txt?raw'

// Course 7 — Read and write files: the export moves to data/, reports go to out/date=…/ atomically,
// and the phones' JSON is read by a parser of our own. Every value shown is a session's.
const CODE = ['Data.scala', 'Device.scala', 'Event.scala', 'Ids.scala', 'Io.scala', 'Main.scala', 'Parse.scala', 'ParseError.scala', 'Play.scala', 'Rules.scala', 'Timed.scala', 'Transform.scala', 'project.scala']
const DAY1 = 'data/plays/2026-10-01.csv'
const DAY2 = 'data/plays/2026-10-02.csv'
const UP = 'data/uploads/phone-u03.jsonl'
const OUT = ['out/date=2026-10-01/chart.csv', 'out/date=2026-10-02/chart.csv']
const sansCode = (s: string) => s.split('\n').filter((l) => !l.startsWith('Compil'))

const o1 = printed(s1)
const files = ideFrame2({
  model: 'Using: open, read, and always close',
  tree: explorerTree([...CODE, DAY1], 'Io.scala', ['Io.scala', DAY1]),
  editor: { file: 'Io.scala', code: io1, highlight: linesFrom(io1, 'def readLines', 'Using(') },
  session: s1,
  side: [
    {
      type: 'group', id: 'using', title: 'Using(Source.fromFile(…))(…)', icon: 'file', tone: 'ingest', children: [
        { type: 'item', id: 'open', title: 'open the file', sub: 'the resource', icon: 'file' },
        { type: 'item', id: 'read', title: 'read every line', sub: 'getLines().toList', icon: 'layers' },
        { type: 'item', id: 'close', title: 'close it, always', sub: 'even if reading throws', icon: 'lock', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'try', title: 'readLines returns a Try', tone: 'ingest', columns: ['file', 'result'], rows: [
        { cells: ['2026-10-01.csv', `Success: ${o1[0].match(/(\d+) rows/)![1]} rows`], tone: 'store' },
        { cells: ['2026-10-02.csv', 'Failure: not found'], tone: 'consume' },
      ],
    },
  ],
  edges: [{ from: 'open', to: 'read' }, { from: 'read', to: 'close' }],
})

const chart2 = sansCode(s2).slice(sansCode(s2).indexOf('$ cat out/chart.csv') + 1)
const writing = ideFrame2({
  model: 'A report: rows, then lines, then a file',
  tree: explorerTree([...CODE, DAY1, 'out/chart.csv'], 'Io.scala', [], ['out']),
  editor: { file: 'Io.scala', code: io2, highlight: [...linesFrom(io2, 'def chartCsv', 'mkString'), ...linesFrom(io2, 'def write', 'writeString')] },
  session: s2,
  side: [
    {
      type: 'group', id: 'flow', title: 'From the chart to a file', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'rows', title: 'topTracks(counted, 5)', sub: 'five named tuples', icon: 'chart' },
        { type: 'item', id: 'csv', title: 'chartCsv(rows)', sub: 'a header and one line each', icon: 'code' },
        { type: 'item', id: 'file', title: 'write(out/chart.csv, …)', sub: 'folders made as needed', icon: 'file', tone: 'store' },
      ],
    },
    { type: 'table', id: 'cat', title: 'out/chart.csv', tone: 'store', rows: chart2.map((l) => [l]) },
  ],
  edges: [{ from: 'rows', to: 'csv' }, { from: 'csv', to: 'file' }],
})

const days = printed(s3).filter((l) => l.includes('→')).map((l) => l.match(/^(\S+): (\d+) plays/)!.slice(1))
const partitions = ideFrame2({
  model: 'One folder per day: date=…',
  tree: explorerTree([...CODE, DAY1, DAY2, ...OUT], 'Main.scala', [DAY2], ['out']),
  editor: { file: 'Main.scala', code: main3, highlight: [lineOf(main3, 'Files.list'), ...linesFrom(main3, 'for (day, plays)', 'write(target')] },
  session: s3,
  side: [
    {
      type: 'group', id: 'split', bare: true, children: [
        { type: 'item', id: 'group', title: 'groupBy(dayIn(newYork))', sub: `${days.length} days`, icon: 'boxes' },
        {
          type: 'tree', id: 'outdir', title: 'out', entries: [
            { name: 'date=2026-10-01', children: [{ name: 'chart.csv', state: 'new' }] },
            { name: 'date=2026-10-02', children: [{ name: 'chart.csv', state: 'new' }] },
          ],
        },
      ],
    },
    { type: 'table', id: 'counts', title: 'Counted plays per partition', tone: 'store', columns: ['date=', 'plays'], rows: days.map(([d, n]) => [d, n]) },
  ],
  edges: [{ from: 'group', to: 'outdir', label: 'one write per day' }],
})

const md5 = sansCode(s4).filter((l) => /^[0-9a-f]{32} /.test(l))
const reruns = ideFrame2({
  model: 'Write aside, then move into place',
  tree: explorerTree([...CODE, DAY1, DAY2, ...OUT], 'Io.scala', [], ['out']),
  editor: { file: 'Io.scala', code: io4, highlight: linesFrom(io4, 'def write', 'Files.move') },
  session: s4,
  side: [
    {
      type: 'group', id: 'steps', title: 'write(path, text)', icon: 'shield', tone: 'ingest', children: [
        { type: 'item', id: 'temp', title: '.writing-….tmp', sub: 'the new text, beside the old file', icon: 'file' },
        { type: 'item', id: 'move', title: 'Files.move(…, ATOMIC_MOVE)', sub: 'one step: old file, or new file', icon: 'zap' },
        { type: 'item', id: 'done', title: 'chart.csv', sub: 'never half-written', icon: 'check', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'same', title: 'Two runs, one result (md5sum)', tone: 'store', columns: ['partition', 'run 1', 'run 2'], rows: [0, 1].map((i) => [
        md5[i].match(/date=(\S+)\//)![1].slice(5), md5[i].slice(0, 8) + '…', md5[i + 2].slice(0, 8) + '…',
      ]),
    },
  ],
  edges: [{ from: 'temp', to: 'move' }, { from: 'move', to: 'done' }],
})

const jsonAdt = ideFrame2({
  model: 'Every JSON value is one of six shapes',
  tree: explorerTree([...CODE, 'Json.scala', DAY1, DAY2, UP, 'out/'], 'Json.scala', ['Json.scala', UP], ['out']),
  editor: { file: 'Json.scala', code: json5, highlight: linesFrom(json5, 'case Null', 'case Obj') },
  session: s5,
  side: [
    {
      type: 'group', id: 'tree', title: 'Json.Obj: the like, as a tree', icon: 'branch', tone: 'ingest', dir: 'grid', cols: 2, children: [
        { type: 'item', id: 'j-type', title: '"type" → Str', sub: '"like"', icon: 'key' },
        { type: 'item', id: 'j-ms', title: '"ms" → Num', sub: '214000.0: a Double', icon: 'key' },
        { type: 'item', id: 'j-dev', title: '"devices" → Arr', sub: 'a List of Json', icon: 'layers' },
        { type: 'item', id: 'j-items', title: 'Str("phone"), Null', sub: 'Json inside Json', icon: 'boxes', tone: 'store' },
      ],
    },
    { type: 'table', id: 'shapes', title: 'JSON text → Json', tone: 'ingest', columns: ['text', 'case'], rows: [['null', 'Null'], ['true', 'Bool'], ['214000', 'Num'], ['"u03"', 'Str'], ['[…]', 'Arr'], ['{…}', 'Obj']] },
  ],
  edges: [{ from: 'j-dev', to: 'j-items', label: 'items' }],
})

const o6 = printed(s6)
const parser = ideFrame2({
  model: 'Recursive descent: one method per shape',
  tree: explorerTree([...CODE, 'Json.scala', 'JsonParser.scala', DAY1, DAY2, UP, 'out/'], 'JsonParser.scala', ['JsonParser.scala'], ['out']),
  editor: { file: 'JsonParser.scala', code: parser6, highlight: linesFrom(parser6, 'private def parseValue', "case _ => fail(\"a value\")") },
  session: s6,
  side: [
    {
      type: 'group', id: 'calls', title: '{"ms":[214000,null,true]}', icon: 'branch', tone: 'ingest', children: [
        { type: 'item', id: 'c-obj', title: "parseValue: '{'", sub: 'elements(field())', icon: 'code' },
        { type: 'item', id: 'c-field', title: 'field: "ms", then parseValue', sub: "':' between them", icon: 'key' },
        { type: 'item', id: 'c-arr', title: "parseValue: '['", sub: 'elements(parseValue())', icon: 'layers' },
        { type: 'item', id: 'c-leaf', title: 'parseNumber, word null, word true', sub: 'the leaves: no more nesting', icon: 'check', tone: 'store' },
      ],
    },
    { type: 'table', id: 'samples', title: 'Three samples', tone: 'ingest', rows: o6.map((l) => ({ cells: [l.startsWith('ok') ? 'ok: {"type":"like",…}' : l.replace('refused, ', '')], tone: l.startsWith('ok') ? 'store' as const : 'consume' as const })) },
  ],
  edges: [{ from: 'c-obj', to: 'c-field', label: 'calls' }, { from: 'c-field', to: 'c-arr', label: 'calls' }, { from: 'c-arr', to: 'c-leaf', label: 'calls' }],
})

const o7 = printed(s7)
const decode = ideFrame2({
  model: 'JSON → Event: one field at a time',
  tree: explorerTree([...CODE, 'Decode.scala', 'Json.scala', 'JsonParser.scala', DAY1, DAY2, UP, 'out/'], 'Decode.scala', ['Decode.scala'], ['out']),
  // The play case's inner for is folded: the shape of decode is the point.
  editor: { file: 'Decode.scala', code: decode7, highlight: linesFrom(decode7, 'def decode', 'yield event'), show: [[lineOf(decode7, 'def decode'), lineOf(decode7, 'case "play"')], [lineOf(decode7, 'yield Event.Played'), lineOf(decode7, 'yield event')]] },
  session: s7,
  side: [
    {
      type: 'group', id: 'steps', title: 'decode(line)', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'd-parse', title: 'JsonParser.parse', sub: 'text → Json, or BadUpload', icon: 'code' },
        { type: 'item', id: 'd-fields', title: 'type, user_id, track_id', sub: 'json.text(name): Either', icon: 'key' },
        { type: 'item', id: 'd-kind', title: 'kind match', sub: 'play → Played(Play.from(…))', icon: 'branch', tone: 'store' },
      ],
    },
    { type: 'table', id: 'events', title: 'phone-u03.jsonl', tone: 'store', rows: o7.slice(1).map((l) => ({ cells: [l.trim().replace('refused: column 65: expected a closing quote', 'refused: column 65')], tone: l.includes('refused') ? 'consume' as const : 'store' as const })) },
  ],
  edges: [{ from: 'd-parse', to: 'd-fields' }, { from: 'd-fields', to: 'd-kind' }],
})

export const saveScenes: Record<string, SceneModel> = {
  'save-files': files,
  'save-writing': writing,
  'save-partitions': partitions,
  'save-safe-reruns': reruns,
  'save-json-adt': jsonAdt,
  'save-parser': parser,
  'save-decode': decode,
}
