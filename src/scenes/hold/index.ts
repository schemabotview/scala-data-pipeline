import type { SceneModel } from '@graphlearning/graphl-flow'
import { holdVals } from './vals'
import { holdNumbers } from './numbers'
import { holdStrings } from './strings'
import { holdCaseClass } from './case-class'
import { holdOption } from './option'
import { holdTuples } from './tuples'
import { holdLists } from './lists'
import { holdMapsSets } from './maps-sets'
import { holdImmutability } from './immutability'

export const holdScenes: Record<string, SceneModel> = {
  'hold-vals': holdVals,
  'hold-numbers': holdNumbers,
  'hold-strings': holdStrings,
  'hold-case-class': holdCaseClass,
  'hold-option': holdOption,
  'hold-tuples': holdTuples,
  'hold-lists': holdLists,
  'hold-maps-sets': holdMapsSets,
  'hold-immutability': holdImmutability,
}
