import type { TreeEntry } from '@graphlearning/graphl-flow'

// The explorer through Course 2: project.scala (the pin), Main.scala, and scala-cli's own build
// folder, muted: it appears at the first compile (2.1) and is never edited.
export const project = (main: 'none' | 'new' | 'active', pin: 'new' | 'plain' = 'plain'): TreeEntry[] => [
  { name: '.scala-build', folder: true, state: 'muted' },
  ...(main === 'none' ? [] : [{ name: 'Main.scala', state: main } as TreeEntry]),
  { name: 'project.scala', ...(pin === 'new' && { state: 'new' as const }) },
]
