import { tree, type FileState } from './tree'

// A flat project's explorer from its file names: the open file is 'active', the files a section adds
// are 'new' (a new file is also the open one, drawn new). Names sort as an IDE sorts them.
export const explorer = (names: string[], open: string, added: string[] = []) =>
  tree(Object.fromEntries([...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
    .map((n): [string, FileState] => [n, added.includes(n) ? 'new' : n === open ? 'active' : ''])))

/** The program's printed lines: the session without its commands and scala-cli's Compiling lines. */
export const printed = (session: string) => session.split('\n').filter((l) => l && !l.startsWith('$') && !l.startsWith('Compil'))
