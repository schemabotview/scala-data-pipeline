#!/usr/bin/env python3
"""Replay every spine step and compare its terminal transcript with what the code really prints.

The spine is the course's one project, `playstream`, kept as real files: one snapshot per step in
spine/<course>/<step>/project/. Each step's session.txt is the terminal pane a scene shows — `$ `
lines are commands, everything else is their output. Scenes import these files with Vite's `?raw`,
so a frame can only show what this script has verified. Ported from java-bank's spine.py.

  python3 scripts/spine.py            check every step (exit 1 on any difference)
  python3 scripts/spine.py --write    re-run every step and rewrite its session.txt / captures
  python3 scripts/spine.py start/03   only the steps whose path starts with an argument

Each step is replayed in a fresh temp copy named playstream, inside a temp "home" directory, by ONE
bash process, so `cd` and exported variables carry from command to command as they do in a real
terminal. A command followed by `scala> ` lines is an interactive session (the Scala REPL): it is
run in a pseudo-terminal and fed those lines; `     | ` lines are a snippet's continuation, typed as
written. Temp paths are rewritten to /home/ana/playstream, the path the frames show.

The toolchain is the pin, whatever the machine's PATH says (scripts/install-scala.sh installs it):
JAVA_HOME and PATH point at JDK_HOME, and `scala-cli` is SCALA_CLI. Scala 3.9.0 itself is pinned by
the project (`//> using scala 3.9.0` in project.scala) and comes from the coursier cache, which is
the machine's real one (COURSIER_CACHE), so no step downloads. JAVA_TOOL_OPTIONS — which every JVM
announces on stderr ("Picked up JAVA_TOOL_OPTIONS: …") — is moved to SCALA_CLI_JVM_OPTS, which only
the scala-cli launcher reads: a cloud machine's proxy still reaches coursier and never a transcript.
scala-cli colours its output even on a dumb terminal; the colour codes are stripped.

THE SPINE IS CUMULATIVE. Every step is the step before it plus the changes it declares, and this
script fails a step whose project differs from its parent's anywhere it did not declare — so nothing
written for the app is thrown away or edited silently. Each step.json says where it sits:

  {"first": true}               starts the chain (2.1: the toolchain, and project.scala)
  {"from": "start/01-scala-cli", continues that step; `changes` lists every path it adds, edits or
   "changes": ["Main.scala"]}   removes (a directory covers everything under it). A declared path
                                that did not change fails too: the list is the section's diff.
  {"lab": true}                 a standalone lab outside the chain: the real output a concept scene
                                shows (Course 1, and every full-scene detour)

A failure branch (run the wrong version, then fix it) is two steps with the same `from`.
Build output (.scala-build/, .bsp/, out/, *.class, *.tasty) is never compared.

step.json (other keys, all optional):
  {"start": "home"}             start in the directory ABOVE the project (default: the project)
  {"capture": ["path", ...]}    files a scene shows; saved to captured/. A relative path is in the
                                project; an absolute one is the machine's, saved under captured/
                                without its leading slash
  {"project": "name"}           the folder's name (default playstream): a lab is not the spine
  {"volatile": true}            output carries ids or timings that change every run: compared with every
                                digit and hex address masked, so the text and shape are checked but not
                                the numbers
  {"setup": ["cmd", ...]}       run silently before the transcript: the state a step starts from
"""
import json
import os
import pty
import re
import select
import shlex
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / 'spine'
# Every output in the course is produced on this JDK (COURSE-PLAN.md, "Java: JDK 25 LTS"). A different
# JDK changes the banner and the compiler's messages, so it is refused up front rather than reported as
# a hundred transcript differences. Keep these three in step with scripts/install-jdk.sh.
PINNED = 'openjdk 25.0.5.0.3'
JDK_HOME = Path('/usr/lib/jvm/java-25-openjdk-amd64')
SCALA_CLI = Path('/usr/local/scala-cli-1.19.0')
TOOLS = ('java', 'javap', 'jar')
IGNORED_DIRS = {'.scala-build', '.bsp', 'out'}
IGNORED_SUFFIXES = {'.class', '.tasty'}
SHOWN_HOME = '/home/ana'
PROJECT = 'playstream'
ANSI = re.compile(r'\x1b\[[0-9;?]*[@-~]|\x1b[=>]|\r')
MARK = '__SPINE_MARK__'
REPL = 'scala> '
MORE = '     | '
APP_PROMPT = 'playstream> '


def commands(session: str) -> list[tuple[str, list[tuple[str, bool]]]]:
    """Split a transcript into (command, [(typed line, is a continuation)]) pairs."""
    out: list[tuple[str, list[tuple[str, bool]]]] = []
    for line in session.splitlines():
        if line.startswith('$ '):
            out.append((line[2:], []))
        elif out and line.startswith(REPL):
            out[-1][1].append((line[len(REPL):], False))
        elif out and (line.startswith(MORE) or line == MORE.rstrip()):
            out[-1][1].append((line[len(MORE):], True))
        elif out and line.startswith(APP_PROMPT):
            # The app's own prompt, if it ever has one: typed into the pty like a REPL line.
            out[-1][1].append((line[len(APP_PROMPT):], False))
    return out


def continued(screen: str, inputs: list[tuple[str, bool]]) -> str:
    """Give each continuation line back its `     | ` prompt.

    Ported from java-bank, where jshell on a dumb terminal (the only mode whose screen is plain text)
    prints its main prompt but NOT the continuation prompt, so a typed continuation echoes bare. Each
    one is found in order after the previous typed line and given the prompt a real terminal shows.
    A line that already carries it is left alone.
    """
    lines, at = screen.split('\n'), 0
    for text, more in inputs:
        for i in range(at, len(lines)):
            if lines[i] == text or lines[i].endswith(REPL + text) or lines[i] == MORE + text:
                if more:
                    lines[i] = MORE + text
                at = i + 1
                break
    return '\n'.join(lines)


def repl(cwd: Path, env: dict, inputs: list[tuple[str, bool]], argv: list[str]) -> str:
    """Run an interactive command (the Scala REPL) in a pty, type each input line, return the screen."""
    pid, fd = pty.fork()
    if pid == 0:
        os.chdir(cwd)
        os.execvpe(argv[0], argv, {**env, 'TERM': 'dumb'})
    screen = b''

    def read(until, timeout: float) -> None:
        """Read the screen until `until(text)` holds, or the timeout passes."""
        nonlocal screen
        end = time.time() + timeout
        while time.time() < end and not until(ANSI.sub('', screen.decode(errors='replace'))):
            ready, _, _ = select.select([fd], [], [], 0.05)
            if ready:
                try:
                    chunk = os.read(fd, 4096)
                except OSError:
                    return
                if not chunk:
                    return
                screen += chunk

    # A line is typed only once its prompt is on screen: the REPL takes seconds to start, and a line
    # typed early echoes ahead of the banner. "On screen" means a NEW prompt, after the previous
    # line's echo — the old one is still the screen's last text until the echo arrives. A
    # continuation line has no prompt to wait for on a dumb terminal (see `continued`), so it waits
    # for the previous line's echo alone.
    text = lambda: ANSI.sub('', screen.decode(errors='replace'))
    mark = 0
    for line, more in inputs:
        if more:
            read(lambda t, m=mark: '\n' in t[m:], 30)
        else:
            read(lambda t, m=mark: '\n' in t[m:] and t.endswith((REPL, APP_PROMPT)) if m else t.endswith((REPL, APP_PROMPT)), 30)
            # jshell (java-bank) printed its prompt a moment BEFORE it switched the terminal to read a
            # line; a line typed in that gap echoed twice. Kept for the Scala REPL: it costs 0.3s a line.
            read(lambda t: False, 0.3)
        mark = len(text())
        os.write(fd, line.encode() + b'\r')
    read(lambda t: False, 1.0)
    for _ in range(100):
        if os.waitpid(pid, os.WNOHANG)[0]:
            break
        time.sleep(0.1)
    else:
        os.kill(pid, 9)
        os.waitpid(pid, 0)
        screen += b'\n[the session did not exit: end it with :quit in session.txt]'
    text = ANSI.sub('', screen.decode(errors='replace'))
    return continued('\n'.join(l.rstrip() for l in text.split('\n')).strip('\n'), inputs)


def environment(home: Path) -> dict:
    """The replay's environment: the pinned JDK and scala-cli first, the machine's proxy kept off stderr."""
    env = {k: v for k, v in os.environ.items() if k not in ('JAVA_TOOL_OPTIONS', 'JDK_JAVA_OPTIONS', '_JAVA_OPTIONS', 'CLASSPATH')}
    return {**env, 'HOME': str(home), 'NO_COLOR': '1', 'TERM': 'dumb', 'PS1': '',
            'JAVA_HOME': str(JDK_HOME), 'SCALA_CLI_JVM_OPTS': os.environ.get('JAVA_TOOL_OPTIONS', ''),
            # The temp HOME would give coursier an empty cache every step: keep the real one.
            'COURSIER_CACHE': os.environ.get('COURSIER_CACHE', str(Path.home() / '.cache' / 'coursier' / 'v1')),
            'PATH': f"{JDK_HOME / 'bin'}:{SCALA_CLI / 'bin'}:/usr/local/bin:/usr/bin:/bin"}


def replay(step: Path) -> tuple[str, dict[str, str]]:
    config = config_of(step)
    session = (step / 'session.txt').read_text()
    with tempfile.TemporaryDirectory() as tmp:
        home = Path(tmp) / 'home'
        project = home / config.get('project', PROJECT)
        home.mkdir()
        if (step / 'project').exists():
            shutil.copytree(step / 'project', project)
        if config.get('start') != 'home':  # a step starting from home makes the folder itself
            project.mkdir(exist_ok=True)
        env = environment(home)
        cwd = home if config.get('start') == 'home' else project
        for cmd in config.get('setup', []):
            subprocess.run(['bash', '-c', cmd], cwd=project, env=env, check=True, capture_output=True)
        blocks: list[str] = []
        for cmd, inputs in commands(session):
            if inputs:
                output = repl(cwd, env, inputs, shlex.split(cmd))
            else:
                script = f'cd {cwd!s}\n{{ {cmd}\n}} 2>&1\necho "{MARK}$PWD"\n'
                state = home / '.spine-state'
                if state.exists():
                    script = state.read_text() + script
                r = subprocess.run(['bash', '-c', script + f'declare -p PATH 2>/dev/null > {state}'],
                                   env=env, capture_output=True, text=True)
                text = ANSI.sub('', r.stdout)
                output, _, after = text.partition(MARK)
                if after:
                    cwd = Path(after.split('\n')[0])
                output = output.rstrip('\n')
                if state.exists():
                    saved = state.read_text()
                    state.write_text(saved.replace('declare -x', 'export').replace('declare --', 'export') + '\n')
            blocks.append(f'$ {cmd}' + (f'\n{output}' if output else ''))
        transcript = '\n'.join(blocks)
        captured = {name: (project / name).read_text() for name in config.get('capture', [])}
    real = str(home)
    fix = lambda s: s.replace(real, SHOWN_HOME).replace(str(Path(tmp).resolve() / 'home'), SHOWN_HOME)
    return fix(transcript).rstrip('\n') + '\n', {k: fix(v) for k, v in captured.items()}


def masked(text: str, step: Path) -> str:
    """For a volatile step, hide the numbers that legitimately change from run to run."""
    config = config_of(step)
    if not config.get('volatile'):
        return text
    # An identity hash (`Play@1b6d3586`) or an address differs in its hex LETTERS too: mask it whole first.
    return re.sub(r'\d+(?:[.,]\d+)*', '#', re.sub(r'(0x|@)[0-9a-f]+\b', r'\1#', text))


def config_of(step: Path) -> dict:
    return json.loads((step / 'step.json').read_text()) if (step / 'step.json').exists() else {}


def files(step: Path) -> dict[str, bytes]:
    """A step's project as {relative path: bytes}, without build output."""
    root = step / 'project'
    if not root.exists():
        return {}
    return {
        p.relative_to(root).as_posix(): p.read_bytes()
        for p in sorted(root.rglob('*'))
        if p.is_file() and not IGNORED_DIRS & set(p.relative_to(root).parts) and p.suffix not in IGNORED_SUFFIXES
    }


def lineage(step: Path) -> list[str]:
    """Why this step is not its parent plus its declared changes (empty when it is)."""
    name = step.relative_to(ROOT)
    config = config_of(step)
    kinds = [k for k in ('first', 'from', 'lab') if config.get(k)]
    if len(kinds) != 1:
        return [f'{name}: step.json needs exactly one of "first", "from", "lab" (has {kinds or "none"})']
    if 'from' not in kinds:
        return [f'{name}: "changes" only means something with "from"'] if config.get('changes') else []
    parent = ROOT / config['from']
    if not (parent / 'session.txt').exists():
        return [f'{name}: "from" names {config["from"]}, which is not a step']
    if config_of(parent).get('lab'):
        return [f'{name}: "from" names a lab, which is outside the chain']
    changes = config.get('changes') or []
    if not changes:
        return [f'{name}: "from" without "changes" — a step that changes nothing is not a section']
    under = lambda path, c: path == c or path.startswith(c.rstrip('/') + '/')
    covered = lambda path: any(under(path, c) for c in changes)
    before, after = files(parent), files(step)
    differs = {path for path in before.keys() | after.keys() if before.get(path) != after.get(path)}
    out = [f'{name}: {path} differs from {config["from"]} but is not in "changes"' for path in sorted(differs) if not covered(path)]
    out += [f'{name}: "changes" lists {c}, which did not change' for c in changes if not any(under(p, c) for p in differs)]
    return out


def main() -> int:
    write = '--write' in sys.argv
    missing = [t for t in TOOLS if not (JDK_HOME / 'bin' / t).exists()] + ([] if (SCALA_CLI / 'bin' / 'scala-cli').exists() else ['scala-cli'])
    banner = subprocess.run([JDK_HOME / 'bin' / 'java', '--version'], capture_output=True, text=True,
                            env=environment(Path.home())).stdout.split('\n')[0] if not missing else ''
    if missing or not banner.startswith(PINNED + ' '):
        print(f'✗ the pinned toolchain is not installed ({", ".join(missing) or banner}): run scripts/install-scala.sh (CLAUDE.md)')
        return 1
    only = [a for a in sys.argv[1:] if not a.startswith('--')]
    steps = sorted(p.parent for p in ROOT.glob('*/*/session.txt'))
    steps = [s for s in steps if not only or any(str(s.relative_to(ROOT)).startswith(o) for o in only)]
    problems = 0
    # The chain is checked over EVERY step, whatever was asked for: a filtered run must not hide a
    # parent edited out from under its children.
    for problem in (p for s in sorted(p.parent for p in ROOT.glob('*/*/session.txt')) for p in lineage(s)):
        problems += 1
        print(f'✗ {problem}')
    if problems and write:
        print('✗ the chain is broken: fix step.json or the snapshots before rewriting transcripts')
        return 1
    for step in steps:
        transcript, captured = replay(step)
        name = step.relative_to(ROOT)
        if write:
            (step / 'session.txt').write_text(transcript)
            for file, text in captured.items():
                target = step / 'captured' / file.lstrip('/')
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text(text)
            print(f'wrote {name}')
            continue
        expected = (step / 'session.txt').read_text()
        if masked(transcript, step) != masked(expected, step):
            problems += 1
            print(f'✗ {name}: the terminal pane differs from a real run')
            import difflib
            sys.stdout.writelines(difflib.unified_diff(expected.splitlines(True), transcript.splitlines(True), 'session.txt', 'real run'))
        for file, text in captured.items():
            if (step / 'captured' / file.lstrip('/')).read_text() != text:
                problems += 1
                print(f'✗ {name}: captured/{file} differs from a real run')
    if not write:
        print(f"{'✗' if problems else '✓'} {len(steps)} spine step(s) replayed, {problems} problem(s)")
    return 1 if problems else 0


if __name__ == '__main__':
    sys.exit(main())
