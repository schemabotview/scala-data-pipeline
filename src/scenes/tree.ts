import type { TreeEntry } from '@graphlearning/graphl-flow'

// The explorer through Course 4: scala-cli's build folder (muted), then the project's files in
// order. `files` maps a name to its state in this section: 'new' (added here), 'active' (open in the
// editor), or '' (there, untouched).
export type FileState = 'new' | 'active' | ''
export const tree = (files: Record<string, FileState>): TreeEntry[] => [
  { name: '.scala-build', folder: true, state: 'muted' },
  ...Object.entries(files).map(([name, state]) => (state ? { name, state } : { name })),
]
