import type { TreeEntry } from '@graphlearning/graphl-flow'
import { tree, type FileState } from './tree'

// A flat project's explorer from its file names: the open file is 'active', the files a section adds
// are 'new' (a new file is also the open one, drawn new). Names sort as an IDE sorts them.
export const explorer = (names: string[], open: string, added: string[] = []) =>
  tree(Object.fromEntries([...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
    .map((n): [string, FileState] => [n, added.includes(n) ? 'new' : n === open ? 'active' : ''])))

/** The program's printed lines: the session without its commands and scala-cli's Compiling lines. */
export const printed = (session: string) => session.split('\n').filter((l) => l && !l.startsWith('$') && !l.startsWith('Compil'))

/**
 * An explorer with folders, from paths (`data/plays/x.csv`): folders first, then files, each level
 * sorted as an IDE sorts. `open` and `added` name full paths; `muted` names folders drawn muted
 * (generated output, such as out/). A folder is drawn open, its children listed; a path ending in
 * `/` is a folder drawn closed (`out/`, once the explorer runs out of rows).
 */
export const explorerTree = (paths: string[], open: string, added: string[] = [], muted: string[] = []): TreeEntry[] => {
  type Node = { files: string[]; dirs: Map<string, Node> }
  const root: Node = { files: [], dirs: new Map() }
  const closed: string[] = []
  for (const p of paths) {
    if (p.endsWith('/')) { closed.push(p.slice(0, -1)); continue }
    const parts = p.split('/')
    let at = root
    for (const d of parts.slice(0, -1)) at = at.dirs.get(d) ?? (at.dirs.set(d, { files: [], dirs: new Map() }), at.dirs.get(d)!)
    at.files.push(p)
  }
  const sort = (a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base' })
  const build = (node: Node, prefix: string): TreeEntry[] => [
    ...[...node.dirs.keys()].sort(sort).map((d): TreeEntry => ({
      name: d, children: build(node.dirs.get(d)!, `${prefix}${d}/`), ...(muted.includes(`${prefix}${d}`) && { state: 'muted' as const }),
    })),
    ...node.files.sort(sort).map((p): TreeEntry => {
      const name = p.split('/').at(-1)!
      return added.includes(p) ? { name, state: 'new' } : p === open ? { name, state: 'active' } : { name }
    }),
  ]
  const top = build(root, '')
  const shut: TreeEntry[] = closed.map((name) => ({ name, folder: true, ...(muted.includes(name) && { state: 'muted' as const }) }))
  return [{ name: '.scala-build', folder: true, state: 'muted' }, ...[...shut, ...top.filter((e) => e.children)].sort((a, b) => sort(a.name, b.name)), ...top.filter((e) => !e.children)]
}
