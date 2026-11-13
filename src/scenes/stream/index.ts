import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, linesFrom } from '../ide'
import { SIDE_W, ideFrame2 } from '../frame'
import { explorerTree, printed } from '../files'
import watch1 from '../../../spine/stream/01-watch/project/stream/Watch.scala?raw'
import s1 from '../../../spine/stream/01-watch/session.txt?raw'
import arrival2 from '../../../spine/stream/02-event-time/project/stream/Arrival.scala?raw'
import s2 from '../../../spine/stream/02-event-time/session.txt?raw'
import windows3 from '../../../spine/stream/03-windows/project/stream/Windows.scala?raw'
import s3 from '../../../spine/stream/03-windows/session.txt?raw'
import watermark4 from '../../../spine/stream/04-watermarks/project/stream/Watermark.scala?raw'
import s4 from '../../../spine/stream/04-watermarks/session.txt?raw'
import job5 from '../../../spine/stream/05-fold/project/stream/Job.scala?raw'
import s5 from '../../../spine/stream/05-fold/session.txt?raw'
import ck6 from '../../../spine/stream/06-checkpoints/project/stream/Checkpoint.scala?raw'
import s6 from '../../../spine/stream/06-checkpoints/session.txt?raw'
import job7 from '../../../spine/stream/07-exactly-once/project/stream/Job.scala?raw'
import s7 from '../../../spine/stream/07-exactly-once/session.txt?raw'

// Course 11 — Follow it live: a watched folder, event time, windows, a watermark, the stream as a
// fold, checkpoints and a crash, exactly-once output. Every value shown is a session's.
const ROOT = ['CsvCodec.scala', 'Data.scala', 'Device.scala', 'Event.scala', 'Ids.scala', 'Io.scala', 'Log.scala', 'Main.scala', 'Monoid.scala', 'Parse.scala', 'ParseError.scala', 'Play.scala', 'Rank.scala', 'Rules.scala', 'Timed.scala', 'Transform.scala', 'project.scala', 'data/', 'json/', 'out/', 'scale/', 'test/']
const STREAM = ['Watch.scala', 'Arrival.scala', 'Windows.scala', 'Watermark.scala', 'Job.scala', 'Checkpoint.scala']
const files = (n: number, open: string, isNew = true) => explorerTree([...ROOT, ...STREAM.slice(0, n).map((f) => `stream/${f}`)], `stream/${open}`, isNew ? [`stream/${open}`] : [], ['out'])
const PLOT_W = SIDE_W - 34

const o1 = printed(s1)
const watch = ideFrame2({
  model: 'A watched folder: arrivals, as they happen',
  tree: files(1, 'Watch.scala'),
  editor: { file: 'stream/Watch.scala', code: watch1, highlight: [lineOf(watch1, 'inbox.register'), ...linesFrom(watch1, 'val key = watcher.take()', 'key.reset()')] },
  session: s1,
  side: [
    {
      type: 'group', id: 'flow', title: 'inbox/, watched', icon: 'folder', tone: 'ingest', children: [
        { type: 'item', id: 'mv', title: 'mv out/b1.tmp inbox/b1.jsonl', sub: 'a whole file appears at once', icon: 'file' },
        { type: 'item', id: 'event', title: 'ENTRY_CREATE', sub: 'watcher.take() wakes up', icon: 'bell' },
        { type: 'item', id: 'read', title: 'read it', sub: o1.at(-1)!.replace('picked up ', ''), icon: 'check', tone: 'store' },
      ],
    },
    { type: 'table', id: 'said', title: 'The watcher said', tone: 'store', rows: o1.map((l) => [l]) },
  ],
  edges: [{ from: 'mv', to: 'event' }, { from: 'event', to: 'read' }],
})

const lates = printed(s2).map((l) => l.match(/^(e\d+) .*: +(\d+)h(\d+)m late$/)!.slice(1)).map(([id, h, m]) => [id, Number(h) * 60 + Number(m)] as [string, number])
const eventTime = ideFrame2({
  model: 'Two clocks: when it happened, when we heard',
  tree: files(2, 'Arrival.scala'),
  editor: { file: 'stream/Arrival.scala', code: arrival2, highlight: [lineOf(arrival2, 'case class Arrival'), ...linesFrom(arrival2, 'extension (a: Arrival)', 'def lateBy')], show: [[1, lineOf(arrival2, 'case class Arrival')], linesFrom(arrival2, 'extension (a: Arrival)', 'def lateBy').filter((_, i, a) => i === 0 || i === a.length - 1) as [number, number]] },
  session: s2,
  side: [
    {
      type: 'plot', id: 'delay', title: 'Minutes until heard (cut at 200)', compact: true, w: PLOT_W, x: { labels: lates.map(([id]) => id.slice(3)) }, y: { min: 0, max: 200, step: 50 },
      series: [{ kind: 'bar', points: lates.map(([, m], i) => [i, Math.min(m, 200)]), tone: 'ingest' }],
    },
    {
      type: 'table', id: 'worst', title: 'The late ones', tone: 'consume', columns: ['play', 'played', 'heard'], rows: printed(s2).filter((l) => /\s([2-9]|\d\d)h/.test(l)).map((l) => {
        const [, id, played, heard] = l.match(/^(e\d+) played (\S+ \S+), heard (\S+ \S+):/)!
        return [id, played, heard]
      }),
    },
  ],
})

const o3 = printed(s3)
const windows = ideFrame2({
  model: 'A tumbling window: each play in its hour',
  tree: files(3, 'Windows.scala'),
  editor: { file: 'stream/Windows.scala', code: windows3, highlight: [lineOf(windows3, 'def windowOf'), lineOf(windows3, 'def windowEnd'), ...linesFrom(windows3, 'def countWindows', 'combineAll')] },
  session: s3,
  side: [
    {
      type: 'group', id: 'bins', title: '10-02, by event time', icon: 'clock', tone: 'ingest', dir: 'grid', cols: 2, children: o3.map((l, i) => {
        const [, hour, counts] = l.match(/^10-02 (\d\d:00)\s+(.*)$/)!
        return { type: 'item' as const, id: `w${i}`, title: `${hour} – ${String(Number(hour.slice(0, 2)) + 1).padStart(2, '0')}:00`, sub: counts, icon: 'clock', tone: 'store' as const }
      }),
    },
    { type: 'table', id: 'note', title: 'windowOf(play)', tone: 'ingest', columns: ['started at', 'window'], rows: [['20:10:12', '20:00'], ['20:55:02', '20:00'], ['21:02:44', '21:00']] },
  ],
  edges: [{ from: 'w0', to: 'w1' }, { from: 'w2', to: 'w3' }],
})

const o4 = printed(s4)
const watermarks = ideFrame2({
  model: 'A watermark says when a window is final',
  tree: files(4, 'Watermark.scala'),
  editor: { file: 'stream/Watermark.scala', code: watermark4, highlight: [lineOf(watermark4, 'val allowedLateness'), ...linesFrom(watermark4, 'val watermark =', 'val (ready, waiting)')], show: [[1, lineOf(watermark4, 'val allowedLateness')], [lineOf(watermark4, 'latest = ('), lineOf(watermark4, 'val (ready, waiting)')]] },
  session: s4,
  side: [
    {
      type: 'group', id: 'rule', title: 'watermark = latest event − 1 hour', icon: 'gauge', tone: 'ingest', children: [
        { type: 'item', id: 'final', title: 'window end ≤ watermark', sub: 'final: written, never reopened', icon: 'lock', tone: 'store' },
        { type: 'item', id: 'late', title: 'a play for a final window', sub: 'goes to the late report', icon: 'bell', tone: 'consume' },
      ],
    },
    { type: 'table', id: 'log', title: 'Batch by batch', tone: 'ingest', rows: o4.map((l) => ({ cells: [l.trim().replace('.jsonl', '').replace(': watermark ', ': watermark ').replace(/^(final|late)\s+/, '$1 ')], tone: l.includes('late') ? 'consume' as const : l.includes('final') ? 'store' as const : undefined })) },
  ],
  edges: [{ from: 'final', to: 'late', label: 'after that' }],
})

const o5 = printed(s5)
const fold = ideFrame2({
  model: 'The stream is a fold over batches',
  tree: files(5, 'Job.scala'),
  editor: { file: 'stream/Job.scala', code: job5, highlight: [lineOf(job5, 'case class StreamState'), lineOf(job5, 'def step'), lineOf(job5, 'batches.foldLeft')] },
  session: s5,
  side: [
    {
      type: 'group', id: 'loop', title: 'step(state, batch)', icon: 'activity', tone: 'ingest', dir: 'grid', cols: 2, children: [
        { type: 'item', id: 'state', title: 'StreamState', sub: 'latest, open, closed', icon: 'database' },
        { type: 'item', id: 'batch', title: 'a batch of plays', sub: 'one file', icon: 'file' },
        { type: 'item', id: 'next', title: 'the next StreamState', sub: 'a new value: no vars', icon: 'database', tone: 'store' },
        { type: 'item', id: 'out', title: 'Output', sub: 'finals and late plays', icon: 'screen', tone: 'store' },
      ],
    },
    { type: 'table', id: 'res', title: 'Same answers as the vars', tone: 'store', rows: o5.map((l) => [l.replace('.jsonl', '')]) },
  ],
  edges: [{ from: 'state', to: 'next' }, { from: 'batch', to: 'out' }],
})

const o6 = s6.split('\n')
const checkpoints = ideFrame2({
  model: 'A checkpoint: where to start again',
  tree: files(6, 'Checkpoint.scala'),
  editor: { file: 'stream/Checkpoint.scala', code: ck6, highlight: [...linesFrom(ck6, 'if sys.env.contains("CRASH")', 'write(checkpointFile')] },
  session: s6,
  side: [
    {
      type: 'group', id: 'tl', title: 'b3, processed twice', icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 'write', title: 'b3: outputs written', sub: 'a final window, a late play', icon: 'file' },
        { type: 'item', id: 'crash', title: 'crash: exit 137', sub: 'before the checkpoint was saved', icon: 'bell', tone: 'consume' },
        { type: 'item', id: 'again', title: 'resume: b3 again', sub: 'the checkpoint says only b1, b2', icon: 'activity' },
      ],
    },
    { type: 'table', id: 'late', title: 'cat out/late.csv', tone: 'consume', rows: o6.slice(o6.indexOf('$ cat out/late.csv') + 1).filter(Boolean).map((l) => [l]) },
  ],
  edges: [{ from: 'write', to: 'crash' }, { from: 'crash', to: 'again' }],
})

const o7 = printed(s7).map((l) => l.replace(/^(INFO|WARNING) playstream: /, ''))
const exactlyOnce = ideFrame2({
  model: 'Exactly once: replay a batch, change nothing',
  tree: files(6, 'Job.scala', false),
  editor: { file: 'stream/Job.scala', code: job7, highlight: [lineOf(job7, 'val fresh = plays.filterNot'), lineOf(job7, 'val seen = state.seen')] },
  session: s7,
  side: [
    {
      type: 'group', id: 'two', title: 'Two rules', icon: 'shield', tone: 'ingest', children: [
        { type: 'item', id: 'seen', title: 'state.seen: every event id', sub: 'a re-upload counts nothing twice', icon: 'fingerprint', tone: 'store' },
        { type: 'item', id: 'replace', title: 'out/late/<batch>.csv, replaced', sub: 'a replay rewrites, never appends', icon: 'file', tone: 'store' },
      ],
    },
    { type: 'table', id: 'log', title: 'Crash, resume, a re-upload', tone: 'store', rows: o7.filter((l) => l.includes('already') || l === 'e2010').map((l) => [l.replace(', 0 already counted', '').replace(' already counted', ' seen')]) },
  ],
  edges: [{ from: 'seen', to: 'replace' }],
})

export const streamScenes: Record<string, SceneModel> = {
  'stream-watch': watch,
  'stream-event-time': eventTime,
  'stream-windows': windows,
  'stream-watermarks': watermarks,
  'stream-fold': fold,
  'stream-checkpoints': checkpoints,
  'stream-exactly-once': exactlyOnce,
}
