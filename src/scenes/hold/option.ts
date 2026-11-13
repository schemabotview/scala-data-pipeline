import type { SceneModel } from '@graphlearning/graphl-flow'
import { lineOf } from '../ide'
import { ideFrame2 } from '../frame'
import { tree } from '../tree'
import code from '../../../spine/hold/05-option/project/Main.scala?raw'
import session from '../../../spine/hold/05-option/session.txt?raw'

// §5 — Option: an old web player sends no device. device becomes Option[String]: Some("phone") or
// None, never null, and getOrElse says what to use when there is none. Results are the session's.
const out = session.split('\n').filter((l) => !l.startsWith('$') && !l.startsWith('Compil'))

export const holdOption: SceneModel = ideFrame2({
  model: 'Option: Some(value) or None',
  tree: tree({ 'Main.scala': 'active', 'Play.scala': '', 'project.scala': '' }),
  editor: { file: 'Main.scala', code, highlight: [lineOf(code, 'Some(f(5))'), lineOf(code, 'None)'), lineOf(code, 'play.device.getOrElse'), lineOf(code, 'old.device.getOrElse')] },
  session,
  side: [
    {
      type: 'group', id: 'cases', title: 'device: Option[String]', icon: 'boxes', tone: 'ingest', dir: 'grid', cols: 2, children: [
        { type: 'item', id: 'some', title: 'Some("phone")', sub: 'e0001: a value inside', icon: 'check', tone: 'store' },
        { type: 'item', id: 'none', title: 'None', sub: 'e0002: nothing sent', icon: 'archive', tone: 'neutral' },
        { type: 'item', id: 'r-some', title: out[2], sub: 'the value', icon: 'screen', tone: 'store' },
        { type: 'item', id: 'r-none', title: out[3], sub: 'the fallback', icon: 'screen' },
      ],
    },
    {
      type: 'table', id: 'vs', title: 'Why not null?', tone: 'ingest', columns: ['', 'null', 'Option'], rows: [
        ['the type', 'hides it', 'says it'],
        ['misused', 'crashes', 'won\'t compile'],
      ],
    },
  ],
  edges: [
    { from: 'some', to: 'r-some', label: 'getOrElse' },
    { from: 'none', to: 'r-none', label: 'getOrElse' },
  ],
})
