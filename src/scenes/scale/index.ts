import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, linesFrom } from '../ide'
import { SIDE_W, ideFrame2 } from '../frame'
import { explorerTree, printed } from '../files'
import { outputOf } from '../lab'
import gen1 from '../../../spine/scale/01-ten-million/project/Gen.scala?raw'
import s1 from '../../../spine/scale/01-ten-million/session.txt?raw'
import scale2 from '../../../spine/scale/02-heap/project/Scale.scala?raw'
import s2 from '../../../spine/scale/02-heap/session.txt?raw'
import stream3 from '../../../spine/scale/03-streaming/project/Stream.scala?raw'
import s3 from '../../../spine/scale/03-streaming/session.txt?raw'
import timing4 from '../../../spine/scale/04-measure/project/Timing.scala?raw'
import s4 from '../../../spine/scale/04-measure/session.txt?raw'
import shuffle5 from '../../../spine/scale/05-partition/project/Shuffle.scala?raw'
import s5 from '../../../spine/scale/05-partition/session.txt?raw'
import parallel6 from '../../../spine/scale/06-every-core/project/Parallel.scala?raw'
import s6 from '../../../spine/scale/06-every-core/session.txt?raw'
import shuffle7 from '../../../spine/scale/07-skew/project/Shuffle.scala?raw'
import s7 from '../../../spine/scale/07-skew/session.txt?raw'
import sort8 from '../../../spine/scale/08-external-sort/project/Sort.scala?raw'
import s8 from '../../../spine/scale/08-external-sort/session.txt?raw'

// Course 10 — Ten million plays. Sizes and timings are this build's (volatile steps): every number
// on screen is parsed from a session, never typed.
const CODE = ['CsvCodec.scala', 'Data.scala', 'Decode.scala', 'Device.scala', 'Event.scala', 'Ids.scala', 'Io.scala', 'Json.scala', 'JsonParser.scala', 'Log.scala', 'Main.scala', 'Monoid.scala', 'Parse.scala', 'ParseError.scala', 'Play.scala', 'Rank.scala', 'Rules.scala', 'Timed.scala', 'Transform.scala', 'project.scala', 'data/', 'out/', 'test/']
const NEW = ['Gen.scala', 'Scale.scala', 'Stream.scala', 'Timing.scala', 'Shuffle.scala', 'Parallel.scala', 'Sort.scala']
const files = (upTo: number, open: string) => explorerTree([...CODE, ...NEW.slice(0, upTo)], open, [NEW[upTo - 1]], ['out'])
const PLOT_W = SIDE_W - 34
const ms = (s: string, label: string) => Number(s.split('\n').find((l) => l.startsWith(label))!.replace(label, '').replace(/[,\s]|ms/g, ''))

const o1 = printed(s1)
const tenMillion = ideFrame2({
  model: 'Ten million plays do not fit in a List',
  tree: files(2, 'Gen.scala'),
  editor: { file: 'Gen.scala', code: gen1, highlight: [lineOf(gen1, 'val random = Random'), ...linesFrom(gen1, '// One track has gone viral', 'val track =')] },
  session: s1,
  side: [
    {
      type: 'group', id: 'steps', title: 'The same, for 10,000,000', icon: 'database', tone: 'ingest', children: [
        { type: 'item', id: 'gen', title: 'generate 10000000', sub: o1[0].replace(/^wrote 10,000,000 plays to /, ''), icon: 'file' },
        { type: 'item', id: 'list', title: 'naive: readLines(…).get', sub: 'every line in one List, then every Play', icon: 'layers' },
        { type: 'item', id: 'oom', title: 'OutOfMemoryError', sub: 'Java heap space, at -Xmx512m', icon: 'bell', tone: 'consume' },
      ],
    },
    { type: 'table', id: 'seeded', title: 'Seeded: the same file every run', tone: 'ingest', rows: printed(s1).filter((l) => /^e\d/.test(l)).map((l) => [l.split(',').slice(0, 3).join(',') + ',…']) },
  ],
  edges: [{ from: 'gen', to: 'list' }, { from: 'list', to: 'oom' }],
})

const gc = outputOf(s2, s2.split('\n')[0].slice(2)).split('\n').map((l) => l.match(/(\d+)M->(\d+)M\((\d+)M\)/)!.slice(1).map(Number))
const pauses = outputOf(s2, s2.split('\n').filter((l) => l.startsWith('$ '))[1].slice(2))
const heap: SceneModel = {
  title: 'The heap fills, and the collector cannot help',
  sub: 'the naive run with -Xlog:gc: after each young collection, almost nothing was garbage',
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'code', badge: 1, title: 'Scale.scala', sub: 'every line, then every Play, kept', icon: 'file', tone: 'ingest', children: [
        { type: 'code', id: 'src', filename: 'Scale.scala', lang: 'scala', code: scale2, highlight: [lineOf(scale2, 'readLines(bigFile).get'), lineOf(scale2, 'parseAll')] },
        {
          type: 'table', id: 'gens', title: 'G1: the heap in regions', columns: ['where', 'holds'], rows: [
            ['young', 'new objects: most die young'], { cells: ['old', 'survivors: kept for good'], tone: 'consume' }, ['a pause', 'copy the living, free the rest'],
          ],
        },
      ],
    },
    {
      type: 'group', id: 'log', badge: 2, title: 'The GC log', sub: 'dots: in use before a pause; line: after it', icon: 'activity', tone: 'consume', children: [
        {
          type: 'plot', id: 'curve', title: 'before → after a pause (MB)', x: { min: 0, max: gc.length + 1, step: 2, label: 'pause' }, y: { min: 0, max: 520, step: 100, label: 'MB' },
          series: [
            { kind: 'line', points: gc.map(([, after], i) => [i + 1, after]), tone: 'consume' },
            { kind: 'scatter', points: gc.map(([before], i) => [i + 1, before]), tone: 'ingest' },
            { kind: 'segment', from: [0, 512], to: [gc.length + 1, 512], label: '-Xmx512m' },
          ],
        },
        { type: 'table', id: 'end', rows: [[`${pauses} pauses, then OutOfMemoryError`], ['each freed almost nothing: all live']] },
      ],
    },
  ],
  edges: [{ from: 'code', to: 'log', label: 'runs' }],
}

const o3 = printed(s3)
const streaming = ideFrame2({
  model: 'An Iterator pipeline: constant memory',
  tree: files(3, 'Stream.scala'),
  editor: { file: 'Stream.scala', code: stream3, highlight: linesFrom(stream3, 'source.getLines()', 'foldLeft') },
  session: s3,
  side: [
    {
      type: 'group', id: 'pipe', title: 'One line at a time', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'line', title: 'getLines(): one line', sub: 'read, used, forgotten', icon: 'file' },
        { type: 'item', id: 'play', title: 'parse, collect counted', sub: 'one Map(track -> 1)', icon: 'zap' },
        { type: 'item', id: 'acc', title: 'foldLeft(…)(_ |+| _)', sub: 'the only thing kept: 8 counts', icon: 'activity', tone: 'store' },
      ],
    },
    {
      type: 'plot', id: 'mem', title: 'Heap needed, MB', compact: true, w: PLOT_W, x: { labels: ['naive', 'streaming'] }, y: { min: 0, max: 600, step: 100 },
      series: [{ kind: 'bar', points: [[0, 512], [1, Number(o3[1].match(/(\d+) MB/)![1])]], tone: 'store' }, { kind: 'segment', from: [-0.5, 512], to: [1.5, 512], label: 'limit' }],
    },
  ],
  edges: [{ from: 'line', to: 'play' }, { from: 'play', to: 'acc' }],
})

const stages = ['read', 'split', 'parse', 'aggregate']
const measure = ideFrame2({
  model: 'Measure first: where the time goes',
  tree: files(4, 'Timing.scala'),
  editor: { file: 'Timing.scala', code: timing4, highlight: linesFrom(timing4, 'def timed', 'result') },
  session: s4,
  side: [
    {
      type: 'plot', id: 'times', title: 'Each pass over 10,000,000 lines (ms)', compact: true, w: PLOT_W, x: { labels: stages }, y: { min: 0, max: 4000, step: 1000 },
      series: [{ kind: 'bar', points: stages.map((s, i) => [i, ms(s4, s)]), tone: 'ingest' }],
    },
    {
      type: 'table', id: 'cost', title: 'Each stage, alone', tone: 'ingest', columns: ['stage', 'adds (ms)'], rows: stages.map((s, i) => [s, i === 0 ? ms(s4, s) : ms(s4, s) - ms(s4, stages[i - 1])]),
    },
  ],
})

const parts5 = printed(s5).filter((l) => /part-\d\.csv/.test(l)).map((l) => [l.match(/part-(\d)/)![1], Number(l.trim().split(/\s+/)[0])] as [string, number])
const partition = ideFrame2({
  model: 'A shuffle: each track to one partition',
  tree: files(5, 'Shuffle.scala'),
  editor: { file: 'Shuffle.scala', code: shuffle5, highlight: [...linesFrom(shuffle5, 'def partitionOf', 'Math.floorMod'), lineOf(shuffle5, 'writers(partitionOf')] },
  session: s5,
  side: [
    {
      type: 'group', id: 'route', title: 'partitionOf(line, 4)', icon: 'branch', tone: 'ingest', dir: 'row', children: [
        { type: 'item', id: 'key', title: 'track id', sub: 'the key', icon: 'key' },
        { type: 'item', id: 'hash', title: 'hashCode % 4', sub: 'same track, same file', icon: 'boxes', tone: 'store' },
      ],
    },
    {
      type: 'plot', id: 'sizes', title: 'Plays per partition (millions)', compact: true, w: PLOT_W, x: { labels: parts5.map(([p]) => `part-${p}`) }, y: { min: 0, max: 6, step: 1 },
      series: [{ kind: 'bar', points: parts5.map(([, n], i) => [i, n / 1e6]), tone: 'consume' }],
    },
  ],
  edges: [{ from: 'key', to: 'hash' }],
})

const o6 = printed(s6)
const everyCore = ideFrame2({
  model: 'Every core: split, count, combine',
  tree: files(6, 'Parallel.scala'),
  editor: { file: 'Parallel.scala', code: parallel6, highlight: linesFrom(parallel6, 'val all = timed', 'combineAll(Await') },
  session: s6,
  side: [
    {
      type: 'group', id: 'fan', title: 'Future.traverse(parts)', icon: 'cpu', tone: 'ingest', children: [
        { type: 'item', id: 'futures', title: '4 Futures, one per partition', sub: 'each counts its own file', icon: 'cpu' },
        { type: 'item', id: 'combine', title: 'combineAll(partials)', sub: 'the Monoid joins them: any order', icon: 'layers', tone: 'store' },
      ],
    },
    {
      type: 'plot', id: 'speed', title: 'Counting 10M plays (ms)', compact: true, w: PLOT_W, x: { labels: ['one core', 'every core'] }, y: { min: 0, max: 5000, step: 1000 },
      series: [{ kind: 'bar', points: [[0, ms(s6, 'one core')], [1, ms(s6, 'every core')]], tone: 'store' }],
    },
    { type: 'table', id: 'res', title: 'And', tone: 'store', rows: [[o6[0]], [o6.at(-1)!], [`speedup: ${(ms(s6, 'one core') / ms(s6, 'every core')).toFixed(1)}×, not 4×`]] },
  ],
  edges: [{ from: 'futures', to: 'combine' }],
})

const parts7 = printed(s7).filter((l) => /part-\d\.csv/.test(l)).map((l) => Number(l.trim().split(/\s+/)[0]))
const runs7 = s7.split('\n')
const one7 = ms(runs7.slice(runs7.findIndex((l) => l.includes('-M parallel'))).join('\n'), 'one core')
const all7 = ms(runs7.slice(runs7.findIndex((l) => l.includes('-M parallel'))).join('\n'), 'every core')
const skew = ideFrame2({
  model: 'Skew: one hot key, one slow partition',
  tree: explorerTree([...CODE, ...NEW.slice(0, 6)], 'Shuffle.scala', [], ['out']),
  editor: { file: 'Shuffle.scala', code: shuffle7, highlight: linesFrom(shuffle7, 'def saltedPartitionOf', 'Math.floorMod(key') },
  session: s7,
  side: [
    {
      type: 'plot', id: 'sizes', title: 'Plays per partition (millions)', compact: true, w: PLOT_W, x: { labels: parts5.map(([p]) => `part-${p}`) }, y: { min: 0, max: 8, step: 2 },
      series: [
        { kind: 'bar', points: parts5.map(([, n], i) => [i, n / 1e6]), label: 'by track', tone: 'consume' },
        { kind: 'bar', points: parts7.map((n, i) => [i, n / 1e6]), label: 'salted', tone: 'store' },
      ],
    },
    { type: 'table', id: 'speed', title: 'Every core, now', tone: 'store', columns: ['partitioned', 'speedup'], rows: [
      ['by track', `${(ms(s6, 'one core') / ms(s6, 'every core')).toFixed(1)}×`], ['salted t03', `${(one7 / all7).toFixed(1)}×`],
    ] },
  ],
})

const head8 = printed(s8).filter((l) => /^e\d/.test(l)).map((l) => l.split(',').slice(0, 4).join(',').replace('2026-10-01T', ''))
const sort = ideFrame2({
  model: 'Sort runs in memory, merge them on disk',
  tree: files(7, 'Sort.scala'),
  editor: { file: 'Sort.scala', code: sort8, highlight: [...linesFrom(sort8, 'source.getLines().drop(1).grouped', 'Files.write(run'), ...linesFrom(sort8, 'val (_, i) = queue.dequeue()', 'queue.enqueue((sortKey(heads(i)')], show: [[lineOf(sort8, 'source.getLines().drop(1).grouped'), lineOf(sort8, 'Files.write(run')], [lineOf(sort8, 'val (_, i) = queue.dequeue()'), lineOf(sort8, 'queue.enqueue((sortKey(heads(i)')]] },
  session: s8,
  side: [
    {
      type: 'group', id: 'merge', title: 'An external sort', icon: 'layers', tone: 'ingest', children: [
        { type: 'item', id: 'chunks', title: '10 runs of 1,000,000', sub: 'each sorted in memory, written out', icon: 'file' },
        { type: 'item', id: 'queue', title: 'a queue of 10 heads', sub: 'take the smallest, refill from its run', icon: 'boxes' },
        { type: 'item', id: 'out', title: 'out/sorted.csv', sub: '10,000,000 lines, by listener then time', icon: 'check', tone: 'store' },
      ],
    },
    { type: 'table', id: 'head', title: 'head -n 3 out/sorted.csv', tone: 'store', rows: head8.map((l) => [l]) },
  ],
  edges: [{ from: 'chunks', to: 'queue' }, { from: 'queue', to: 'out' }],
})

export const scaleScenes: Record<string, SceneModel> = {
  'scale-ten-million': tenMillion,
  'scale-heap': heap,
  'scale-streaming': streaming,
  'scale-measure': measure,
  'scale-partition': partition,
  'scale-every-core': everyCore,
  'scale-skew': skew,
  'scale-external-sort': sort,
}
