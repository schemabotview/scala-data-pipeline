import type { SceneModel } from '@graphlearning/graphl-flow'
import { startScalaCli } from './scala-cli'
import { startMainScala } from './main-scala'
import { startWhatRunDoes } from './what-run-does'
import { startRepl } from './repl'
import { startCompileError } from './compile-error'
import { startException } from './exception'

export const startScenes: Record<string, SceneModel> = {
  'start-scala-cli': startScalaCli,
  'start-main-scala': startMainScala,
  'start-what-run-does': startWhatRunDoes,
  'start-repl': startRepl,
  'start-compile-error': startCompileError,
  'start-exception': startException,
}
