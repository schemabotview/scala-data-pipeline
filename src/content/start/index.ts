import type { Course } from '../types'
import { scalaCli } from './01-scala-cli'
import { mainScala } from './02-main-scala'
import { whatRunDoes } from './03-what-run-does'
import { theRepl } from './04-the-repl'
import { compileErrors } from './05-compile-errors'
import { anException } from './06-an-exception'

export const start: Course = {
  id: 'start',
  title: 'The first program',
  sections: [scalaCli, mainScala, whatRunDoes, theRepl, compileErrors, anException],
}
