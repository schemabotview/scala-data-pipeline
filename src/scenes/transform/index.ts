import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, linesFrom } from '../ide'
import { SIDE_W, ideFrame2 } from '../frame'
import { explorer, printed } from '../files'
import main1 from '../../../spine/transform/01-map-filter/project/Main.scala?raw'
import s1 from '../../../spine/transform/01-map-filter/session.txt?raw'
import t2 from '../../../spine/transform/02-group/project/Transform.scala?raw'
import s2 from '../../../spine/transform/02-group/session.txt?raw'
import t3 from '../../../spine/transform/03-sort-top/project/Transform.scala?raw'
import s3 from '../../../spine/transform/03-sort-top/session.txt?raw'
import t4 from '../../../spine/transform/04-fold/project/Transform.scala?raw'
import s4 from '../../../spine/transform/04-fold/session.txt?raw'
import t5 from '../../../spine/transform/05-time/project/Transform.scala?raw'
import s5 from '../../../spine/transform/05-time/session.txt?raw'
import data5 from '../../../spine/transform/05-time/project/Data.scala?raw'
import t6 from '../../../spine/transform/06-dedup/project/Transform.scala?raw'
import main6 from '../../../spine/transform/06-dedup/project/Main.scala?raw'
import s6 from '../../../spine/transform/06-dedup/session.txt?raw'
import t7 from '../../../spine/transform/07-sessions/project/Transform.scala?raw'
import s7 from '../../../spine/transform/07-sessions/session.txt?raw'
import data7 from '../../../spine/transform/07-sessions/project/Data.scala?raw'
import main8 from '../../../spine/transform/08-laziness/project/Main.scala?raw'
import s8 from '../../../spine/transform/08-laziness/session.txt?raw'

// Course 6 — Transform it: map/filter/flatMap, grouping, top-N, fold, time zones, dedup, sessions,
// laziness. Every number in a side pane is parsed from the step's session (or its Data.scala).
const BASE = ['Data.scala', 'Device.scala', 'Event.scala', 'Ids.scala', 'Main.scala', 'Parse.scala', 'ParseError.scala', 'Play.scala', 'Rules.scala', 'Timed.scala', 'project.scala']
const WITH_T = [...BASE, 'Transform.scala']
const PLOT_W = SIDE_W - 34

const o1 = printed(s1)
const mapFilter = ideFrame2({
  model: 'filter keeps, map changes, flatMap flattens',
  tree: explorer(BASE, 'Main.scala'),
  editor: { file: 'Main.scala', code: main1, highlight: [lineOf(main1, 'good.filter'), lineOf(main1, 'counted.map'), lineOf(main1, 'good.flatMap')] },
  session: s1,
  side: [
    {
      type: 'group', id: 'ops', title: 'Three ways through a list', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'f', title: 'filter(_.isCounted)', sub: o1[0].replace(' plays parsed, ', ' in, ').replace(' counted', ' kept'), icon: 'filter', tone: 'store' },
        { type: 'item', id: 'm', title: 'map(_.msPlayed.toMinutes)', sub: 'one Double per play, then summed', icon: 'zap', tone: 'store' },
        { type: 'item', id: 'fm', title: 'flatMap(_.device)', sub: 'each Option: one value or none', icon: 'layers', tone: 'store' },
      ],
    },
    { type: 'table', id: 'said', title: 'The terminal', tone: 'store', rows: o1.map((l) => [l]) },
  ],
  edges: [{ from: 'f', to: 'm' }, { from: 'm', to: 'fm' }],
})

const perTrack = [...printed(s2)[1].matchAll(/(t\d+) -> (\d+)/g)].map((m) => [m[1], Number(m[2])] as [string, number]).sort((a, b) => a[0].localeCompare(b[0]))
const group = ideFrame2({
  model: 'Group: rows into buckets by a key',
  tree: explorer(WITH_T, 'Transform.scala', ['Transform.scala']),
  editor: { file: 'Transform.scala', code: t2, highlight: linesFrom(t2, 'def playsPerTrack', 'groupMapReduce') },
  session: s2,
  side: [
    {
      type: 'group', id: 'gmr', title: 'groupMapReduce, in three steps', icon: 'boxes', tone: 'ingest', children: [
        { type: 'item', id: 'g', title: 'group by _.trackId', sub: 'a bucket per track', icon: 'boxes' },
        { type: 'item', id: 'mm', title: 'map each play to 1', sub: '_ => 1', icon: 'zap' },
        { type: 'item', id: 'r', title: 'reduce with _ + _', sub: 'add the ones up', icon: 'activity', tone: 'store' },
      ],
    },
    { type: 'table', id: 'counts', title: 'plays per track', tone: 'store', columns: ['track', 'plays'], rows: perTrack.map(([t, n]) => [t, n]) },
  ],
  edges: [{ from: 'g', to: 'mm' }, { from: 'mm', to: 'r' }, { from: 'gmr', to: 'counts' }],
})

const chart = printed(s3).slice(1).map((l) => l.match(/^\s*(\d+)\. (.+?)\s+(\d+)$/)!.slice(1))
const sortTop = ideFrame2({
  model: 'Sort, take five: a chart',
  tree: explorer(WITH_T, 'Transform.scala'),
  editor: { file: 'Transform.scala', code: t3, highlight: linesFrom(t3, 'def topTracks', '.map((track, count)') },
  session: s3,
  side: [
    {
      type: 'plot', id: 'top', title: 'Top tracks, 1 October', compact: true, w: PLOT_W,
      x: { labels: chart.map(([rank]) => `#${rank}`) }, y: { min: 0, max: 8, step: 2, label: 'plays' },
      series: [{ kind: 'bar', points: chart.map(([, , n], i) => [i, Number(n)]), tone: 'store' }],
    },
    { type: 'table', id: 'rows', title: 'Each row: a named tuple', tone: 'ingest', columns: ['#', 'title', 'plays'], rows: chart.map(([r, t, n]) => [r, t, n]) },
  ],
})

const users = printed(s4).slice(1).map((l) => l.trim().split(/\s+/))
const fold = ideFrame2({
  model: 'foldLeft: one value carried through',
  tree: explorer(WITH_T, 'Transform.scala'),
  editor: { file: 'Transform.scala', code: t4, highlight: linesFrom(t4, 'def msPerUser', '  )') },
  session: s4,
  side: [
    {
      type: 'group', id: 'acc', title: 'foldLeft(Map.empty)(…)', icon: 'activity', tone: 'ingest', children: [
        { type: 'item', id: 'start', title: 'totals = Map()', sub: 'the starting value', icon: 'archive' },
        { type: 'item', id: 'step', title: 'each play: totals.updated(…)', sub: 'a new Map, one total bigger', icon: 'zap' },
        { type: 'item', id: 'end', title: 'the last totals', sub: 'is the answer', icon: 'check', tone: 'store' },
      ],
    },
    {
      type: 'plot', id: 'mins', title: 'Minutes per listener', compact: true, w: PLOT_W,
      x: { labels: users.map(([u]) => u) }, y: { min: 0, max: 25, step: 5 },
      series: [{ kind: 'bar', points: users.map(([, m], i) => [i, Number(m)]), tone: 'store' }],
    },
  ],
  edges: [{ from: 'start', to: 'step' }, { from: 'step', to: 'end' }],
})

const o5 = printed(s5)
const lateIds = [...o5[2].matchAll(/e\d+/g)].map((m) => m[0])
const lateRows = data5.split('\n').filter((l) => lateIds.some((id) => l.startsWith(id + ',')))
const time = ideFrame2({
  model: 'Which day? It depends where you are',
  tree: explorer(WITH_T, 'Transform.scala'),
  editor: { file: 'Transform.scala', code: t5, highlight: [lineOf(t5, 'import java.time'), ...linesFrom(t5, 'val newYork', 'toLocalDate')], show: [[1, 2], [lineOf(t5, 'def msPerUser'), lineOf(t5, 'toLocalDate')]] },
  session: s5,
  side: [
    {
      type: 'group', id: 'zones', title: 'e0039, one instant', icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 'inst', title: lateRows.find((l) => l.startsWith('e0039'))!.split(',')[3], sub: 'Instant.parse: a moment, in UTC', icon: 'clock' },
        { type: 'group', id: 'two', bare: true, dir: 'row', children: [
          { type: 'item', id: 'utc', title: '2 October', sub: 'in UTC', icon: 'globe' },
          { type: 'item', id: 'ny', title: '1 October', sub: 'in New York', icon: 'globe', tone: 'store' },
        ] },
      ],
    },
    { type: 'table', id: 'days', title: 'Counted plays per day', tone: 'ingest', columns: ['zone', 'days'], rows: [
      ['UTC', o5[0].replace(/^days in UTC:\s+Map\(/, '').replace(/\)$/, '').replace(/2026-10-/g, '10-')],
      { cells: ['New York', o5[1].replace(/^days in New York:\s+Map\(/, '').replace(/\)$/, '').replace(/2026-10-/g, '10-')], tone: 'store' },
    ] },
  ],
  edges: [{ from: 'inst', to: 'utc' }, { from: 'inst', to: 'ny' }],
})

const o6 = printed(s6)
const dedup = ideFrame2({
  model: 'distinctBy: one row per event id',
  tree: explorer(WITH_T, 'Main.scala'),
  editor: { file: 'Main.scala', code: main6, highlight: [lineOf(main6, 'val repeated'), lineOf(main6, 'val plays = dedup')] },
  session: s6,
  side: [
    {
      type: 'group', id: 'retry', title: 'A retried upload', icon: 'network', tone: 'consume', children: [
        { type: 'group', id: 'copies', bare: true, dir: 'row', children: [
          { type: 'item', id: 'a', title: 'e0024', sub: 'Night Bus, 13:00, sent', icon: 'file' },
          { type: 'item', id: 'b', title: 'e0024', sub: 'sent again: no reply came', icon: 'file', tone: 'consume' },
        ] },
        { type: 'item', id: 'kept', title: 'dedup keeps the first', sub: o6[1], icon: 'check', tone: 'store' },
      ],
    },
    { type: 'table', id: 'chart', title: 'The chart, corrected', tone: 'store', rows: o6.slice(3).map((l) => [l.trim()]) },
  ],
  edges: [{ from: 'a', to: 'kept' }, { from: 'b', to: 'kept' }],
})
void t6

const o7 = printed(s7)
const u01 = data7.split('\n').filter((l) => /^e\d+,u01,/.test(l)).map((l) => l.split(',')).filter((f) => f.length === 6 && /^\d+$/.test(f[4]))
const hourOf = (ts: string) => Number(ts.slice(11, 13)) + Number(ts.slice(14, 16)) / 60
const starts = o7.filter((l) => l.includes('session ')).map((l) => l.match(/from (\d\d:\d\d)/)![1])
const sessionOf = (ts: string) => starts.filter((s) => ts.slice(11, 16) >= s).length
const sorted = [...u01].sort((a, b) => a[3].localeCompare(b[3]))
const sessionsScene = ideFrame2({
  model: 'A gap of 30 minutes ends a session',
  tree: explorer(WITH_T, 'Transform.scala'),
  editor: { file: 'Transform.scala', code: t7, highlight: linesFrom(t7, 'def sessions', '.map(_.reverse)') },
  session: s7,
  side: [
    {
      type: 'plot', id: 'timeline', title: "u01's plays, 1 October", compact: true, w: PLOT_W,
      x: { min: 6, max: 24, step: 3, label: 'hour (UTC)' }, y: { min: 0, max: 12, step: 3, label: 'play #' },
      series: [1, 2, 3].map((n) => ({ kind: 'scatter' as const, points: sorted.map((f, i) => [hourOf(f[3]), i + 1] as [number, number]).filter((_, i) => sessionOf(sorted[i][3]) === n), label: `#${n}` })),
    },
    { type: 'table', id: 'list', title: 'sessions(u01)', tone: 'store', rows: o7.filter((l) => l.includes('session ')).map((l) => [l.trim().replace(/^session /, '#')]) },
  ],
})

const o8 = printed(s8)
const laziness = ideFrame2({
  model: 'An Iterator does nothing until asked',
  tree: explorer(WITH_T, 'Main.scala'),
  editor: { file: 'Main.scala', code: main8, highlight: linesFrom(main8, 'val lines', 'val firstTwo') },
  session: s8,
  side: [
    {
      type: 'group', id: 'pull', title: 'A pull pipeline', icon: 'workflow', tone: 'ingest', children: [
        { type: 'item', id: 'src', title: 'linesIterator', sub: 'a line, when asked', icon: 'file' },
        { type: 'item', id: 'map', title: '.map(parse)', sub: 'parses one, when asked', icon: 'zap' },
        { type: 'item', id: 'take', title: '.take(2).toList', sub: 'asks twice, then stops', icon: 'check', tone: 'store' },
      ],
    },
    { type: 'table', id: 'order', title: 'The order things happened', tone: 'store', rows: o8.map((l) => [l.trim().replace('took 2: List(Right(e0001), Right(e0002))', 'took 2: e0001, e0002')]) },
  ],
  edges: [{ from: 'take', to: 'map', label: 'next?' }, { from: 'map', to: 'src', label: 'next?' }],
})

export const transformScenes: Record<string, SceneModel> = {
  'transform-map-filter': mapFilter,
  'transform-group': group,
  'transform-sort-top': sortTop,
  'transform-fold': fold,
  'transform-time': time,
  'transform-dedup': dedup,
  'transform-sessions': sessionsScene,
  'transform-laziness': laziness,
}
