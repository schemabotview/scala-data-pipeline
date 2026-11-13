import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf, linesFrom } from '../ide'
import { ideFrame2 } from '../frame'
import { explorer, printed } from '../files'
import parse1 from '../../../spine/model/01-enum/project/Parse.scala?raw'
import s1 from '../../../spine/model/01-enum/session.txt?raw'
import main2 from '../../../spine/model/02-adts/project/Main.scala?raw'
import event2 from '../../../spine/model/02-adts/project/Event.scala?raw'
import s2 from '../../../spine/model/02-adts/session.txt?raw'
import event3 from '../../../spine/model/03-exhaustiveness/project/Event.scala?raw'
import s3 from '../../../spine/model/03-exhaustiveness/session.txt?raw'
import ids4 from '../../../spine/model/04-opaque/project/Ids.scala?raw'
import s4 from '../../../spine/model/04-opaque/session.txt?raw'
import play5 from '../../../spine/model/05-smart-constructors/project/Play.scala?raw'
import s5 from '../../../spine/model/05-smart-constructors/session.txt?raw'
import timed6 from '../../../spine/model/06-traits/project/Timed.scala?raw'
import s6 from '../../../spine/model/06-traits/session.txt?raw'
import rules7 from '../../../spine/model/07-extensions/project/Rules.scala?raw'
import s7 from '../../../spine/model/07-extensions/session.txt?raw'
import perr8 from '../../../spine/model/08-errors/project/ParseError.scala?raw'
import s8 from '../../../spine/model/08-errors/session.txt?raw'

// Course 5 — Model the domain: devices and events as enums, ids as opaque types, a Play that can only
// be made valid, a trait, extension methods, and errors as an enum. Every value shown is a session's.
const F1 = ['Data.scala', 'Device.scala', 'Main.scala', 'Parse.scala', 'Play.scala', 'project.scala']
const F2 = [...F1, 'Event.scala']
const F4 = [...F2, 'Ids.scala']
const F6 = [...F4, 'Timed.scala']
const F7 = [...F6, 'Rules.scala']
const F8 = [...F7, 'ParseError.scala']
const replSaid = (s: string, text: string) => s.split('\n').find((l) => l.includes(text))!.replace(/^\s*\|\s*/, '').trim()

const enumScene = ideFrame2({
  model: 'An enum: a closed set of values',
  tree: explorer(F1, 'Parse.scala', ['Device.scala']),
  editor: { file: 'Parse.scala', code: parse1, highlight: [lineOf(parse1, 'Device.values.find'), ...linesFrom(parse1, 'def deviceLabel', 'case None')], show: [[lineOf(parse1, 'Device.values.find'), lineOf(parse1, 'Device.values.find')], linesFrom(parse1, 'def deviceLabel', 'case None').filter((_, i, a) => i === 0 || i === a.length - 1) as [number, number]] },
  session: s1,
  side: [
    {
      type: 'group', id: 'enum', title: 'enum Device', icon: 'boxes', tone: 'ingest', dir: 'row', children: [
        { type: 'item', id: 'phone', title: 'Phone', icon: 'check', tone: 'store' },
        { type: 'item', id: 'web', title: 'Web', icon: 'check', tone: 'store' },
        { type: 'item', id: 'car', title: 'Car', icon: 'check', tone: 'store' },
      ],
    },
    { type: 'item', id: 'typo', title: 'Device.Phnoe', sub: 'refused: did you mean Device.Phone?', icon: 'bell', tone: 'consume' },
    {
      type: 'table', id: 'text', title: 'The export\'s text → a Device', tone: 'ingest', columns: ['text', 'device'], rows: [
        ['"phone"', 'Some(Phone)'], ['"web"', 'Some(Web)'], ['"car"', 'Some(Car)'], { cells: ['""', 'None'], tone: 'neutral' },
      ],
    },
  ],
  edges: [{ from: 'enum', to: 'typo', label: 'only these' }],
})

const adtScene = ideFrame2({
  model: 'Each kind of event has its own fields',
  tree: explorer(F2, 'Event.scala', ['Event.scala']),
  editor: { file: 'Event.scala', code: event2, highlight: linesFrom(event2, 'case Played', 'case Liked') },
  session: s2,
  side: [
    {
      type: 'group', id: 'kinds', title: 'enum Event', icon: 'boxes', tone: 'ingest', children: [
        { type: 'item', id: 'played', title: 'Played(play)', sub: 'a whole Play inside', icon: 'activity', tone: 'store' },
        { type: 'item', id: 'skipped', title: 'Skipped(user, track, at, afterMs)', sub: 'how far in it was skipped', icon: 'zap' },
        { type: 'item', id: 'liked', title: 'Liked(user, track)', sub: 'just who and what', icon: 'check' },
      ],
    },
    { type: 'table', id: 'said', title: 'describe(event), on each', tone: 'store', rows: printed(s2).slice(1).map((l) => [l]) },
  ],
  edges: [{ from: 'kinds', to: 'said', label: 'match' }],
})
void main2

const warn = s3.split('\n').filter((l) => l.startsWith('[warn]'))
const exhaustScene = ideFrame2({
  model: 'The compiler checks every case is handled',
  tree: explorer(F2, 'Event.scala'),
  editor: { file: 'Event.scala', code: event3, highlight: [lineOf(event3, 'case Shared')] },
  session: s3,
  side: [
    {
      type: 'group', id: 'match', title: 'describe(event): event match', icon: 'branch', tone: 'ingest', children: [
        { type: 'item', id: 'm1', title: 'case Played', icon: 'check', tone: 'store' },
        { type: 'item', id: 'm2', title: 'case Skipped', icon: 'check', tone: 'store' },
        { type: 'item', id: 'm3', title: 'case Liked', icon: 'check', tone: 'store' },
        { type: 'item', id: 'm4', title: 'case Shared: missing', sub: 'a MatchError, on the first share', icon: 'bell', tone: 'consume' },
      ],
    },
    {
      type: 'table', id: 'warning', title: 'The warning, read', tone: 'consume', columns: ['says', 'meaning'], rows: [
        [warn[0].replace('[warn] ./', ''), 'where the match is'],
        ['may not be exhaustive', 'a shape is missing'],
        ['fail on: Event.Shared', 'which one'],
      ],
    },
  ],
  edges: [{ from: 'm1', to: 'm2' }, { from: 'm2', to: 'm3' }, { from: 'm3', to: 'm4' }],
})

const opaqueScene = ideFrame2({
  model: 'Opaque types: ids that can\'t be mixed',
  tree: explorer(F4, 'Ids.scala', ['Ids.scala']),
  editor: { file: 'Ids.scala', code: ids4, highlight: [lineOf(ids4, 'opaque type UserId'), lineOf(ids4, 'opaque type TrackId')] },
  session: s4,
  side: [
    {
      type: 'group', id: 'two', title: 'One String, two types', icon: 'key', tone: 'ingest', dir: 'row', children: [
        { type: 'item', id: 'user', title: 'UserId', sub: 'u01', icon: 'user', tone: 'source' },
        { type: 'item', id: 'track', title: 'TrackId', sub: 't03', icon: 'file', tone: 'store' },
      ],
    },
    {
      type: 'table', id: 'when', title: 'catalog(UserId("u01"))', tone: 'consume', columns: ['when', 'it is'], rows: [
        { cells: ['compile time', `${replSaid(s4, 'Found:')} ≠ ${replSaid(s4, 'Required:').replace('Required: ', '')}`], tone: 'consume' },
        ['the result', 'refused: no build'],
        { cells: ['run time', 'a plain String'], tone: 'store' },
      ],
    },
  ],
  edges: [{ from: 'user', to: 'when' }],
})

const smartScene = ideFrame2({
  model: 'A Play can only be made valid',
  tree: explorer(F4, 'Play.scala'),
  editor: { file: 'Play.scala', code: play5, highlight: [lineOf(play5, 'case class Play private'), ...linesFrom(play5, 'object Play', 'else Right')] },
  session: s5,
  side: [
    {
      type: 'group', id: 'gate', title: 'Play.from(…, msPlayed, …)', icon: 'shield', tone: 'ingest', children: [
        { type: 'item', id: 'check', title: 'msPlayed < 0 ?', sub: 'the one rule a Play enforces', icon: 'search' },
        { type: 'group', id: 'out', bare: true, dir: 'row', children: [
          { type: 'item', id: 'ok', title: 'Right(new Play)', sub: 'no: the only way in', icon: 'check', tone: 'store' },
          { type: 'item', id: 'no', title: 'Left(…)', sub: 'yes: negative duration', icon: 'bell', tone: 'consume' },
        ] },
      ],
    },
    { type: 'table', id: 'now', title: 'Rejected, now', tone: 'consume', rows: printed(s5).slice(1).map((l) => [l.replace(/^ *rejected, /, '')]) },
  ],
  edges: [{ from: 'check', to: 'ok' }, { from: 'check', to: 'no' }],
})

const traitScene = ideFrame2({
  model: 'A trait: what different types share',
  tree: explorer(F6, 'Timed.scala', ['Timed.scala']),
  editor: { file: 'Timed.scala', code: timed6, highlight: linesFrom(timed6, 'trait Timed', 'def hour') },
  session: s6,
  side: [
    {
      type: 'group', id: 'tree', title: 'trait Timed', icon: 'clock', tone: 'ingest', children: [
        { type: 'item', id: 't-abstract', title: 'def startedAt: String', sub: 'each type supplies it', icon: 'key' },
        { type: 'item', id: 't-concrete', title: 'def hour: Int = …', sub: 'written once, shared', icon: 'code', tone: 'store' },
      ],
    },
    {
      type: 'group', id: 'impls', bare: true, dir: 'row', children: [
        { type: 'item', id: 'i-play', title: 'Play', sub: 'extends Timed', icon: 'activity', tone: 'store' },
        { type: 'item', id: 'i-skip', title: 'Event.Skipped', sub: 'extends Event, Timed', icon: 'zap', tone: 'store' },
      ],
    },
    { type: 'table', id: 'hours', title: 'moment.hour, for each', tone: 'store', rows: printed(s6).map((l) => [l.replace('2026-10-01T', '').replace(' is in hour ', ' → ')]) },
  ],
  edges: [{ from: 'tree', to: 'i-play' }, { from: 'tree', to: 'i-skip' }],
})

const extScene = ideFrame2({
  model: 'Extension methods: new methods on old types',
  tree: explorer(F7, 'Rules.scala', ['Rules.scala']),
  editor: { file: 'Rules.scala', code: rules7, highlight: [lineOf(rules7, 'extension (ms: Long)'), lineOf(rules7, 'extension (play: Play)')] },
  session: s7,
  side: [
    {
      type: 'group', id: 'calls', title: 'Written as, called as', icon: 'code', tone: 'ingest', children: [
        { type: 'item', id: 'c1', title: 'play.isCounted', sub: 'isCounted(play), behind the scenes', icon: 'check', tone: 'store' },
        { type: 'item', id: 'c2', title: 'play.msPlayed.toMinutes', sub: 'on Long, a type we did not write', icon: 'clock', tone: 'store' },
        { type: 'item', id: 'c3', title: 'play.deviceKind', sub: 'reads left to right', icon: 'screen', tone: 'store' },
      ],
    },
    { type: 'table', id: 'out', title: 'The counted plays', tone: 'store', rows: printed(s7).slice(1).map((l) => [l.trim()]) },
  ],
  edges: [{ from: 'c1', to: 'c2' }, { from: 'c2', to: 'c3' }],
})

const errors = printed(s8).slice(1).map((l) => l.match(/line (\d+), (\S+?)\(.*?\): (.*)$/)!.slice(1))
const errScene = ideFrame2({
  model: 'Errors as an enum: each kind, its data',
  tree: explorer(F8, 'ParseError.scala', ['ParseError.scala']),
  editor: { file: 'ParseError.scala', code: perr8, highlight: [...linesFrom(perr8, 'case WrongFieldCount', 'case NegativeDuration'), lineOf(perr8, 'def message')] },
  session: s8,
  side: [
    {
      type: 'group', id: 'map', bare: true, dir: 'row', children: [
        { type: 'table', id: 'lines', title: 'rejected', tone: 'consume', rows: errors.map(([n]) => ({ id: `l${n}`, cells: [`line ${n}`] })) },
        { type: 'group', id: 'kinds', bare: true, children: errors.map(([n, kind, msg]) => ({ type: 'item' as const, id: `k${n}`, title: kind, sub: msg, icon: 'bell', tone: 'consume' as const })) },
      ],
    },
    {
      type: 'table', id: 'gain', title: 'A String, or a ParseError', tone: 'ingest', columns: ['', 'String', 'ParseError'], rows: [
        ['count by kind', 'parse text', 'match'],
        ['its data', 'in the text', 'a field'],
        ['a new kind', 'unnoticed', 'checked'],
      ],
    },
  ],
  edges: errors.map(([n]) => ({ from: `lines.l${n}`, to: `k${n}` })),
})

export const modelScenes: Record<string, SceneModel> = {
  'model-enum': enumScene,
  'model-adts': adtScene,
  'model-exhaustiveness': exhaustScene,
  'model-opaque': opaqueScene,
  'model-smart-constructors': smartScene,
  'model-traits': traitScene,
  'model-extensions': extScene,
  'model-errors': errScene,
}
