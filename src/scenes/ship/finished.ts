import type { Code } from '@graphlearning/graphl-flow'
import session from '../../../spine/ship/04-serve/session.txt?raw'

// The finished pipeline, really answering: Course 12.4's session, cut to curl's two requests and
// their answers (the JSON wrapped one object a row, as a terminal wraps it). Shown at 1.2 and 12.5.
export function finishedCode(id: string): Code {
  const lines = session.split('\n').filter((l) => l && !l.startsWith('$') && !l.startsWith('INFO'))
  const chart = lines[0].replace(/\},\{/g, '},\n {').split('\n')
  return {
    type: 'code', id, terminal: true, filename: 'terminal: the end of the course',
    code: ['$ curl -s localhost:8080/charts/2026-10-01', ...chart, '$ curl -s localhost:8080/charts/2026-12-25', lines[1]].join('\n'),
  }
}
