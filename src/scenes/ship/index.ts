import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { explorerTree, printed } from '../files'
import { appMap } from '../map'
import { finishedCode } from './finished'
import config1 from '../../../spine/ship/01-config/project/Config.scala?raw'
import s1 from '../../../spine/ship/01-config/session.txt?raw'
import main2 from '../../../spine/ship/02-subcommands/project/Main.scala?raw'
import s2 from '../../../spine/ship/02-subcommands/session.txt?raw'
import log3 from '../../../spine/ship/03-package/project/Log.scala?raw'
import s3 from '../../../spine/ship/03-package/session.txt?raw'
import server4 from '../../../spine/ship/04-serve/project/Server.scala?raw'
import s4 from '../../../spine/ship/04-serve/session.txt?raw'

// Course 12 — Ship it: layered settings, subcommands, one jar, the charts over HTTP, the finished
// pipeline, and where next. Every value shown is a session's.
const ROOT = ['CsvCodec.scala', 'Data.scala', 'Device.scala', 'Event.scala', 'Ids.scala', 'Io.scala', 'Log.scala', 'Main.scala', 'Monoid.scala', 'Parse.scala', 'ParseError.scala', 'Play.scala', 'Rank.scala', 'Rules.scala', 'Timed.scala', 'Transform.scala', 'project.scala', 'data/', 'json/', 'out/', 'scale/', 'stream/', 'test/']
const files = (extra: string[], open: string, added: string[] = []) => explorerTree([...ROOT, ...extra], open, added, ['out', 'reports'])

const o1 = printed(s1).filter((l) => / from /.test(l))
const config = ideFrame2({
  model: 'Settings in layers: the last one wins',
  tree: files(['Config.scala', 'playstream.conf'], 'Config.scala', ['Config.scala', 'playstream.conf']),
  editor: { file: 'Config.scala', code: config1, highlight: [lineOf(config1, 'case s"$key=$value"'), lineOf(config1, 'case (s"PLAYSTREAM_$key"'), lineOf(config1, 'case s"--$key=$value"')] },
  session: s1,
  side: [
    {
      type: 'group', id: 'layers', title: 'Each layer overrides the one before', icon: 'layers', tone: 'ingest', children: [
        { type: 'item', id: 'l-default', title: 'defaults', sub: 'in the code', icon: 'code' },
        { type: 'item', id: 'l-file', title: 'playstream.conf', sub: 'top = 10, out = reports', icon: 'file' },
        { type: 'item', id: 'l-env', title: 'PLAYSTREAM_TOP=3', sub: 'the environment', icon: 'settings' },
        { type: 'item', id: 'l-flag', title: '--zone=Europe/London', sub: 'a flag: the last word', icon: 'terminal', tone: 'store' },
      ],
    },
    { type: 'table', id: 'won', title: 'The second run', tone: 'store', columns: ['key', 'value', 'from'], rows: o1.slice(4).map((l) => l.split(/\s+=\s+|\s+from\s+/)) },
  ],
  edges: [{ from: 'l-default', to: 'l-file' }, { from: 'l-file', to: 'l-env' }, { from: 'l-env', to: 'l-flag' }],
})

const o2 = printed(s2)
const subcommands = ideFrame2({
  model: 'One command, several jobs',
  tree: files(['Config.scala', 'playstream.conf', 'reports/date=2026-10-01/chart.csv', 'reports/date=2026-10-02/chart.csv'], 'Main.scala'),
  editor: { file: 'Main.scala', code: main2, highlight: linesFrom(main2, '@main def playstream', 'case _ =>') },
  session: s2,
  side: [
    {
      type: 'group', id: 'route', title: 'playstream <job> [--flags]', icon: 'terminal', tone: 'ingest', children: [
        { type: 'item', id: 'args', title: 'args minus the --flags', sub: 'Config.load reads the flags', icon: 'filter' },
        {
          type: 'group', id: 'jobs', bare: true, dir: 'row', children: [
            { type: 'item', id: 'j-chart', title: 'chart', sub: 'daily charts', icon: 'chart', tone: 'store' },
            { type: 'item', id: 'j-stream', title: 'stream', sub: 'one tick', icon: 'activity', tone: 'store' },
            { type: 'item', id: 'j-other', title: 'else', sub: 'usage', icon: 'screen' },
          ],
        },
      ],
    },
    { type: 'table', id: 'out', title: 'reports/date=2026-10-01/chart.csv', tone: 'store', rows: o2.filter((l) => /^(rank|\d),/.test(l)).map((l) => [l]) },
  ],
  edges: [{ from: 'args', to: 'j-chart' }, { from: 'args', to: 'j-stream' }, { from: 'args', to: 'j-other' }],
})

const o3 = printed(s3)
const pkg = ideFrame2({
  model: 'One jar: the code and its library',
  tree: files(['Config.scala', 'playstream.conf', 'playstream.jar'], 'Log.scala', ['playstream.jar']),
  editor: { file: 'Log.scala', code: log3, highlight: linesFrom(log3, '// The format travels', 'System.getLogger') },
  session: s3,
  side: [
    {
      type: 'group', id: 'build', title: 'package --assembly', icon: 'package', tone: 'ingest', children: [
        { type: 'group', id: 'parts', bare: true, dir: 'row', children: [
          { type: 'item', id: 'ours', title: 'our classes', sub: 'every folder', icon: 'code' },
          { type: 'item', id: 'lib', title: 'Scala library', sub: 'to run them', icon: 'layers' },
        ] },
        { type: 'item', id: 'jar', title: 'playstream.jar', sub: `${o3.find((l) => l.endsWith('playstream.jar') && /^\d/.test(l))!.split(' ')[0]}, runs anywhere with Java`, icon: 'package', tone: 'store' },
      ],
    },
    { type: 'table', id: 'left', title: 'Not in the jar', tone: 'consume', columns: ['', 'why'], rows: [['tests', 'test only'], ['project.scala', 'scala-cli reads it'], ['→ log format', 'so it moved to code']] },
  ],
  edges: [{ from: 'ours', to: 'jar' }, { from: 'lib', to: 'jar' }],
})

const o4 = printed(s4)
const serve = ideFrame2({
  model: 'GET /charts/<date>: a chart, as JSON',
  tree: files(['Config.scala', 'Server.scala', 'playstream.conf', 'playstream.jar'], 'Server.scala', ['Server.scala']),
  editor: { file: 'Server.scala', code: server4, highlight: [...linesFrom(server4, 'def answer', 'else (404'), ...linesFrom(server4, 'server.createContext', 'info(s"GET')] },
  session: s4,
  side: [
    {
      type: 'group', id: 'req', title: 'A request', icon: 'globe', tone: 'ingest', children: [
        { type: 'item', id: 'get', title: 'GET /charts/2026-10-01', sub: 'curl, a browser, another service', icon: 'network' },
        { type: 'item', id: 'check', title: 'a date? a chart file?', sub: 'nothing else reaches the disk', icon: 'shield' },
        { type: 'item', id: 'json', title: 'chartJson: CSV → Json', sub: 'our Json, rendered', icon: 'code', tone: 'store' },
      ],
    },
    { type: 'table', id: 'answers', title: 'What curl got', tone: 'store', rows: o4.filter((l) => l.includes('GET')).map((l) => ({ cells: [l.replace('INFO playstream: ', '')], tone: l.endsWith('200') ? 'store' as const : 'consume' as const })) },
  ],
  edges: [{ from: 'get', to: 'check' }, { from: 'check', to: 'json', label: 'yes' }],
})

const finished = appMap({
  title: "The finished pipeline: Play-Stream's playstream",
  sub: 'every part built, by hand, from the standard library. On the right: the packaged jar, really answering',
  built: 12,
  output: finishedCode('out-http'),
})

const whereNext: SceneModel = {
  title: 'Where next: each part of playstream, at scale',
  sub: 'you built the ideas by hand; these tools are the same ideas, industrial strength',
  nodes: [
    {
      type: 'group', id: 'map', bare: true, dir: 'grid', cols: 3, children: [
        { type: 'item', id: 'n-spark', title: 'scale/ → Apache Spark', sub: 'partitions, shuffles, skew, sorts: on a cluster', icon: 'spark', tone: 'store' },
        { type: 'item', id: 'n-flink', title: 'stream/ → Apache Flink', sub: 'event time, watermarks, exactly-once checkpoints', icon: 'flink', tone: 'store' },
        { type: 'item', id: 'n-kafka', title: 'inbox/ → Apache Kafka', sub: 'a durable, replayable stream of uploads', icon: 'kafka', tone: 'store' },
        { type: 'item', id: 'n-effects', title: 'Futures → Cats Effect, ZIO', sub: 'concurrency as values, resources that close', icon: 'cpu' },
        { type: 'item', id: 'n-http', title: 'Server → http4s, Tapir', sub: 'typed routes, JSON codecs derived', icon: 'globe' },
        { type: 'item', id: 'n-build', title: 'scala-cli → sbt, Mill', sub: 'many modules, published libraries', icon: 'package' },
      ],
    },
  ],
}

export const shipScenes: Record<string, SceneModel> = {
  'ship-config': config,
  'ship-subcommands': subcommands,
  'ship-package': pkg,
  'ship-serve': serve,
  'ship-finished': finished,
  'ship-where-next': whereNext,
}
