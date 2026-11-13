import { tree, type FileState } from '../tree'

// Course 4's explorer: Data.scala (4.1 on), Main, Parse (4.4 on), Play, project.
export const files = (open: string, added: string[] = [], parse = true) => {
  const names = ['Data.scala', 'Main.scala', ...(parse ? ['Parse.scala'] : []), 'Play.scala', 'project.scala']
  return tree(Object.fromEntries(names.map((n): [string, FileState] => [n, added.includes(n) ? 'new' : n === open ? 'active' : ''])))
}
/** The program's printed lines: the session without its command and scala-cli's Compiling lines. */
export const printed = (session: string) => session.split('\n').filter((l) => l && !l.startsWith('$') && !l.startsWith('Compil'))
