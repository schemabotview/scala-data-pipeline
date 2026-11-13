import type { SceneModel } from '@graphlearning/graphl-flow'
import { appMap } from '../map'
import { outputOf } from '../lab'
import taste from '../../../spine/intro/01-scala/project/Taste.scala?raw'
import session from '../../../spine/intro/01-scala/session.txt?raw'

// Course 1 — Scala, and what we'll build. Two concept scenes: a taste of Scala (the intro lab, six
// real lines replayed on the course's toolchain) beside where Scala is used, and the pipeline's map.
// 1.2 shows the finished pipeline's real output once Course 12 exists (as java-bank's 1.2 does).
const scala1: SceneModel = {
  title: 'Scala',
  sub: 'typed, functional and object-oriented at once, on the JVM: the language of data engineering',
  dir: 'row',
  nodes: [
    {
      type: 'group', id: 'core', title: 'Scala 3.9', icon: 'code', tone: 'ingest', children: [
        { type: 'code', id: 'taste', filename: 'Taste.scala', lang: 'scala', code: taste.trim(), highlight: [6] },
        { type: 'code', id: 'run', terminal: true, filename: 'terminal', code: `$ scala-cli run .\n${outputOf(session, 'scala-cli run .').split('\n').filter((l) => !l.startsWith('Compil')).join('\n')}` },
      ],
    },
    {
      type: 'group', id: 'uses', title: 'Where Scala runs', icon: 'globe', tone: 'store', spread: true, dir: 'grid', cols: 2, children: [
        { type: 'item', id: 'u-data', title: 'data engineering', sub: 'batch and streaming pipelines', icon: 'database', tone: 'store' },
        { type: 'item', id: 'u-stream', title: 'event streams', sub: 'Kafka Streams, Flink jobs', icon: 'activity' },
        { type: 'item', id: 'u-backend', title: 'backends', sub: 'http4s, ZIO, Pekko', icon: 'server' },
        { type: 'item', id: 'u-finance', title: 'finance', sub: 'trading and risk systems', icon: 'chart' },
        { type: 'item', id: 'u-compilers', title: 'compilers and DSLs', sub: 'Scala\'s own, Chisel', icon: 'code' },
        { type: 'item', id: 'u-jvm', title: 'anywhere Java runs', sub: 'every Java library, as is', icon: 'cpu' },
      ],
    },
  ],
  edges: [{ from: 'core', to: 'uses' }],
}

export const introScenes: Record<string, SceneModel> = {
  'intro-scala': scala1,
  'intro-what-we-build': appMap({
    title: "What we'll build: Play-Stream's pipeline",
    sub: 'from counting three plays to ten million, live, on every core: built from the standard library',
    built: 0,
  }),
}
