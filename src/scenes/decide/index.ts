import type { SceneModel } from '@graphlearning/graphl-flow'
import { decideExpressions } from './expressions'
import { decideLoops } from './loops'
import { decideMatch } from './match'
import { decideMethods } from './methods'
import { decideMemory } from './memory'
import { decideFunctions } from './functions'
import { decideExceptions } from './exceptions'
import { decideEither } from './either'
import { decideForComprehensions } from './for-comprehensions'
import { decideEveryBadRow } from './every-bad-row'

export const decideScenes: Record<string, SceneModel> = {
  'decide-expressions': decideExpressions,
  'decide-loops': decideLoops,
  'decide-match': decideMatch,
  'decide-methods': decideMethods,
  'decide-memory': decideMemory,
  'decide-functions': decideFunctions,
  'decide-exceptions': decideExceptions,
  'decide-either': decideEither,
  'decide-for-comprehensions': decideForComprehensions,
  'decide-every-bad-row': decideEveryBadRow,
}
