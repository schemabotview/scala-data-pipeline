// The text helpers every IDE frame and concept scene shares: trimming, tabs, what counts as a prompt
// and where an error report starts, and finding a line by its TEXT. Ported from java-bank's ide.ts,
// without its v1 frame: this repo is IDE frame v2 (frame.ts) from its first section.

export const trim = (text: string) => text.replace(/\n+$/, '')

/** Expand tabs to the next multiple of 8 columns, as a terminal does (a stack trace's `\tat`). */
export const untab = (line: string) => line.replace(/[^\t]*\t/g, (run) => run.slice(0, -1).padEnd((Math.floor((run.length - 1) / 8) + 1) * 8))

/** A line the learner typed: a shell command, a REPL line or its continuation. */
export const PROMPT = /^(\$ |scala> |     \| )/

/**
 * Where an error report starts; it runs red to the next prompt. scala-cli prefixes every compiler
 * message with `[error] ` and follows the last one with "Error compiling project" and "Compilation
 * failed"; an uncaught exception prints its stack trace and the program ends; the REPL frames a
 * compile error as `-- [E007] Type Mismatch Error: ---` and prints an exception's class first.
 */
export const ERROR_START = [
  /^\[error\] /, // scala-cli: the compiler's messages
  /^Exception in thread "/, // an uncaught exception: the stack trace follows
  /^-- (\[E\d+\] )?.*Error: /, // the REPL's compile error
  /^[a-z]+(\.[a-z]+)+\.\w+(Exception|Error)(: |$)/, // the REPL's exception: java.lang.NumberFormatException: …
]

/**
 * The 1-based number of the first line of `code` containing `text`, searching from line `from`.
 * Highlights and folds are found by TEXT, never typed as numbers: a file grows a line upstream and
 * a typed number silently highlights the wrong line (python-expense-tracker's Course 3 did, three
 * times). A missing text throws, which check-render reports as a page error naming the scene.
 */
export function lineOf(code: string, text: string, from = 1): number {
  const lines = code.split('\n')
  for (let i = from - 1; i < lines.length; i++) if (lines[i].includes(text)) return i + 1
  throw new Error(`ide.ts: no line containing ${JSON.stringify(text)} from line ${from}`)
}

/** Every line number from the line containing `first` through the next line containing `last`. */
export function linesFrom(code: string, first: string, last = first): number[] {
  const a = lineOf(code, first), b = lineOf(code, last, a)
  return Array.from({ length: b - a + 1 }, (_, i) => a + i)
}

/** The last line number of `code` (ignoring a trailing newline). */
export const lastLine = (code: string) => trim(code).split('\n').length
