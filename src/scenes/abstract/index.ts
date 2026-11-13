import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { explorerTree, printed } from '../files'
import rank1 from '../../../spine/abstract/01-generics/project/Rank.scala?raw'
import s1 from '../../../spine/abstract/01-generics/session.txt?raw'
import timed2 from '../../../spine/abstract/02-variance/project/Timed.scala?raw'
import s2 from '../../../spine/abstract/02-variance/session.txt?raw'
import s2b from '../../../spine/abstract/02b-array/session.txt?raw'
import ids3 from '../../../spine/abstract/03-givens/project/Ids.scala?raw'
import rank3 from '../../../spine/abstract/03-givens/project/Rank.scala?raw'
import s3 from '../../../spine/abstract/03-givens/session.txt?raw'
import monoid4 from '../../../spine/abstract/04-monoid/project/Monoid.scala?raw'
import s4 from '../../../spine/abstract/04-monoid/session.txt?raw'
import monoid5 from '../../../spine/abstract/05-combine-all/project/Monoid.scala?raw'
import s5 from '../../../spine/abstract/05-combine-all/session.txt?raw'
import codec6 from '../../../spine/abstract/06-derive/project/CsvCodec.scala?raw'
import s6 from '../../../spine/abstract/06-derive/session.txt?raw'

// Course 8 — Generic code and type classes. Every value in a side pane is the session's.
const CODE = ['Data.scala', 'Decode.scala', 'Device.scala', 'Event.scala', 'Ids.scala', 'Io.scala', 'Json.scala', 'JsonParser.scala', 'Main.scala', 'Parse.scala', 'ParseError.scala', 'Play.scala', 'Rules.scala', 'Timed.scala', 'Transform.scala', 'project.scala', 'data/', 'out/']
const files = (extra: string[], open: string, added: string[] = []) => explorerTree([...CODE, ...extra], open, added, ['out'])
const R1 = ['Rank.scala']
const R4 = [...R1, 'Monoid.scala']

const o1 = printed(s1)
const generics = ideFrame2({
  model: 'One method, any key: a type parameter',
  tree: files(R1, 'Rank.scala', ['Rank.scala']),
  editor: { file: 'Rank.scala', code: rank1, highlight: [lineOf(rank1, 'def topN[K]')] },
  session: s1,
  side: [
    { type: 'item', id: 'def', title: 'topN[K](counts: Map[K, Int], n)', sub: 'K: whatever is being counted', icon: 'code', tone: 'ingest' },
    {
      type: 'group', id: 'uses', bare: true, dir: 'row', children: [
        { type: 'item', id: 'k-track', title: 'K = TrackId', sub: 'name: catalog', icon: 'file', tone: 'store' },
        { type: 'item', id: 'k-artist', title: 'K = String', sub: 'artists', icon: 'user', tone: 'store' },
        { type: 'item', id: 'k-device', title: 'K = String', sub: 'device kinds', icon: 'screen', tone: 'store' },
      ],
    },
    { type: 'table', id: 'out', title: 'Number one, three ways', tone: 'store', columns: ['ranked', '#1', 'plays'], rows: o1.map((l) => {
      const [, what, first, n] = l.match(/^(\w+):\s+List\(\(([^,]+),(\d+)\)/)!
      return [what, first, n]
    }) },
  ],
  edges: [{ from: 'def', to: 'k-track' }, { from: 'def', to: 'k-artist' }, { from: 'def', to: 'k-device' }],
})

const errRows = s2b.split('\n').filter((l) => l.startsWith('[error]')).slice(0, 3).flatMap((l) => l.match(/.{1,38}/g)!).map((r) => `! ${r}`).join('\n')
const variance = ideFrame2({
  model: 'A List of plays is a List of Timed',
  tree: files(R1, 'Timed.scala'),
  editor: { file: 'Timed.scala', code: timed2, highlight: [lineOf(timed2, 'def earliest')] },
  session: s2,
  side: [
    {
      type: 'group', id: 'types', title: 'Play extends Timed, so…', icon: 'layers', tone: 'ingest', dir: 'grid', cols: 2, children: [
        { type: 'item', id: 'lp', title: 'List[Play]', icon: 'layers' },
        { type: 'item', id: 'lt', title: 'List[Timed]', sub: 'List[+A]: covariant', icon: 'check', tone: 'store' },
        { type: 'item', id: 'ap', title: 'Array[Play]', icon: 'boxes' },
        { type: 'item', id: 'at', title: 'Array[Timed]', sub: 'Array[A]: refused', icon: 'bell', tone: 'consume' },
      ],
    },
    { type: 'code', id: 'refused', terminal: true, filename: 'the same code, with Array (02b)', code: errRows },
  ],
  edges: [{ from: 'lp', to: 'lt', label: 'is a' }, { from: 'ap', to: 'at', label: 'is not' }],
})
void ids3

const o3 = printed(s3)
const givens = ideFrame2({
  model: 'using: the compiler finds the given',
  tree: files(R1, 'Rank.scala'),
  editor: { file: 'Rank.scala', code: rank3, highlight: linesFrom(rank3, 'def topN', 'sortBy') },
  session: s3,
  side: [
    {
      type: 'group', id: 'search', title: 'topN(byTrack, 3)', icon: 'search', tone: 'ingest', children: [
        { type: 'item', id: 'need', title: 'needs: using Ordering[TrackId]', sub: 'a parameter nobody passes', icon: 'key' },
        { type: 'item', id: 'found', title: 'found: object TrackId\'s given', sub: 'Ordering.String, in Ids.scala', icon: 'search', tone: 'store' },
        { type: 'item', id: 'built', title: 'built: Ordering[(Int, TrackId)]', sub: 'for sortBy\'s pairs, from two givens', icon: 'boxes', tone: 'store' },
      ],
    },
    { type: 'table', id: 'out', title: 'Sorted, with no Ordering written at the call', tone: 'store', rows: [
      [`ids: ${o3[0].match(/List\((t\d+),/)![1]} … ${o3[0].match(/(t\d+)\)$/)![1]}, in order`],
      [`tracks: ${[...o3[1].matchAll(/\((t\d+),(\d+)\)/g)].map((m) => `${m[1]} ${m[2]}`).join(', ')}`],
      [`artists: ${o3[2].match(/\(([^,]+),(\d+)\)/)!.slice(1).join(' ')}, …`],
    ] },
  ],
  edges: [{ from: 'need', to: 'found' }, { from: 'found', to: 'built' }],
})

const o4 = printed(s4)
const monoid = ideFrame2({
  model: 'A type class: one interface, many types',
  tree: files(R4, 'Monoid.scala', ['Monoid.scala']),
  editor: { file: 'Monoid.scala', code: monoid4, highlight: [...linesFrom(monoid4, 'trait Monoid', 'def combine(x: A'), lineOf(monoid4, 'given Monoid[Int]'), lineOf(monoid4, 'given Monoid[Long]'), lineOf(monoid4, 'given [K, V]')] },
  session: s4,
  side: [
    { type: 'item', id: 'trait', title: 'trait Monoid[A]', sub: 'empty, and combine(x, y)', icon: 'code', tone: 'ingest' },
    {
      type: 'group', id: 'inst', bare: true, dir: 'row', children: [
        { type: 'item', id: 'i-int', title: 'Int', sub: '0, +', icon: 'check', tone: 'store' },
        { type: 'item', id: 'i-long', title: 'Long', sub: '0L, +', icon: 'check', tone: 'store' },
        { type: 'item', id: 'i-map', title: 'Map[K, V]', sub: 'if V has one', icon: 'boxes', tone: 'store' },
      ],
    },
    { type: 'table', id: 'out', title: 'x |+| y', tone: 'store', columns: ['typed', 'gives'], rows: [
      ['3 |+| 4', o4[0]], ['two Longs', o4[1]], ['two Maps', o4[2].replace('Map(', '').replace(')', '').replace(/ -> /g, '→').replace(/, /g, ' ')], ['empty Map', o4[3]],
    ] },
  ],
  edges: [{ from: 'trait', to: 'i-int' }, { from: 'trait', to: 'i-long' }, { from: 'trait', to: 'i-map' }],
})

const o5 = printed(s5)
const combineAll = ideFrame2({
  model: 'combineAll: the fold, written once',
  tree: files(R4, 'Monoid.scala'),
  editor: { file: 'Monoid.scala', code: monoid5, highlight: linesFrom(monoid5, 'given [A, B]', 'values.foldLeft') },
  session: s5,
  side: [
    {
      type: 'group', id: 'pass', title: 'One pass over the plays', icon: 'activity', tone: 'ingest', children: [
        { type: 'item', id: 'each', title: 'each play → (1, Map(user → ms))', sub: 'a tiny answer per play', icon: 'zap' },
        { type: 'item', id: 'comb', title: 'combineAll', sub: 'Monoid[(Int, Map[UserId, Long])]: built', icon: 'layers' },
        { type: 'item', id: 'total', title: o5[1].replace(', in one pass', ''), sub: 'both answers, together', icon: 'check', tone: 'store' },
      ],
    },
    { type: 'table', id: 'out', title: 'The terminal', tone: 'store', rows: o5.map((l) => [l.replace(/List\(\((t\d+),(\d+)\), \((t\d+),(\d+)\), \((t\d+),(\d+)\)\)/, '$1 $2, $3 $4, $5 $6')]) },
  ],
  edges: [{ from: 'each', to: 'comb' }, { from: 'comb', to: 'total' }],
})

const out6 = printed(s6)
const derive = ideFrame2({
  model: 'derives: the compiler writes the codec',
  tree: files([...R4, 'CsvCodec.scala'], 'CsvCodec.scala', ['CsvCodec.scala']),
  editor: { file: 'CsvCodec.scala', code: codec6, highlight: [...linesFrom(codec6, 'inline def derived', 'fromNames(constValueTuple'), lineOf(codec6, 'case class ChartRow'), lineOf(codec6, 'case class ListenerRow')], show: [linesFrom(codec6, 'inline def derived', 'fromNames(constValueTuple').filter((_, i, a) => i === 0 || i === a.length - 1) as [number, number], linesFrom(codec6, 'case class ChartRow', 'case class ListenerRow').filter((_, i, a) => i === 0 || i === a.length - 1) as [number, number]] },
  session: s6,
  side: [
    {
      type: 'group', id: 'steps', title: 'case class ChartRow(…) derives CsvCodec', icon: 'boxes', tone: 'ingest', children: [
        { type: 'item', id: 'mirror', title: 'Mirror.ProductOf[ChartRow]', sub: 'the compiler\'s description of it', icon: 'search' },
        { type: 'item', id: 'names', title: 'its field names', sub: 'rank, title, artist, plays', icon: 'key' },
        { type: 'item', id: 'codec', title: 'CsvCodec[ChartRow]', sub: 'a given, ready for toCsv', icon: 'check', tone: 'store' },
      ],
    },
    { type: 'table', id: 'csv', title: 'out/chart.csv', tone: 'store', rows: out6.slice(0, 4).map((l) => [l]) },
  ],
  edges: [{ from: 'mirror', to: 'names', label: 'at compile time' }, { from: 'names', to: 'codec' }],
})

export const abstractScenes: Record<string, SceneModel> = {
  'abstract-generics': generics,
  'abstract-variance': variance,
  'abstract-givens': givens,
  'abstract-monoid': monoid,
  'abstract-combine-all': combineAll,
  'abstract-derive': derive,
}
