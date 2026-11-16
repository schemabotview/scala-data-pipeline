#!/usr/bin/env node
// The YouTube thumbnail for the single full-course film (scripts/out/film.mp4). Ported from
// java-bank's thumb-film.mjs: same poster grammar, same fit-and-fail rules, a Scala card.
//
// Not the shell's `graphl-thumb`: that template is a PER-COURSE poster (58% scene + panel), and a
// cropped 16:9 video frame turns to mush at the ~168px the mobile feed actually renders. A film
// cover needs poster grammar — few elements, enormous type, one focal object.
//
// The card is REAL: every name, status and chart row is cut out of ONE spine step — §12.4's
// session.txt, plus the project files that step replayed — so the cover cannot promise output the
// course does not produce. Anything not found there is a hard error, never a fallback.

import { mkdirSync, readFileSync, readdirSync, existsSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join, dirname, isAbsolute } from 'node:path'
import { execFile } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const run = promisify(execFile)
const repoDir = process.cwd()
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const FFMPEG = ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg'].find(existsSync) ?? 'ffmpeg'

const SCALE = 2
const W = 1280 * SCALE
const H = 720 * SCALE

// ── the real output ─────────────────────────────────────────────────────────────────────────────
const STEP = join(repoDir, 'spine', 'ship', '04-serve')
const SESSION = join(STEP, 'session.txt')
const PROJECT = join(STEP, 'project')

const linesOf = (f) => readFileSync(f, 'utf8').split('\n').map((l) => l.trimEnd())

/**
 * Cut the finished pipeline out of §12.4: the jar's `serve` command, the URL it announced, every
 * GET it logged with the body curl printed, and — from the step's own code — where the plays come
 * from and which file a chart is served from.
 */
function realServe() {
  const L = linesOf(SESSION)
  const first = L.find((l) => /^\$ \S+\.jar serve\b/.test(l))
  if (!first) throw new Error(`no \`<jar> serve\` command in ${SESSION}`)
  // The session runs server, curls and kill as one line; the card shows the server's part of it.
  const cmd = first.replace(/^\$ /, '').split(/\s+&\s+/)[0]
  const jar = cmd.match(/(\S+\.jar)/)[1].replace(/^\.\//, '')

  const serving = L.find((l) => /^INFO \S+: serving charts on \S+$/.test(l))
  if (!serving) throw new Error('the server did not announce where it serves')
  const announce = serving.replace(/^INFO \S+: /, '')

  // `INFO playstream: GET /charts/2026-10-01: 200`, then the body curl printed.
  const gets = []
  for (let i = 0; i < L.length; i++) {
    const m = L[i].match(/^INFO \S+: GET (\/charts\/(\S+)): (\d{3})$/)
    if (m) gets.push({ path: m[1], date: m[2], status: +m[3], body: JSON.parse(L[i + 1]) })
  }
  const ok = gets.find((g) => g.status === 200)
  const miss = gets.find((g) => g.status !== 200)
  if (!ok || !miss) throw new Error('the session does not show both a served chart and a refused one')
  if (!Array.isArray(ok.body) || ok.body.length < 2) throw new Error('the served chart has fewer than 2 rows')

  // Where the plays live (Config's default) and the file `serve` answers from (Server.scala).
  const config = readFileSync(join(PROJECT, 'Config.scala'), 'utf8')
  const dataDir = config.match(/"data"\s*->\s*"([^"]+)"/)?.[1]
  if (!dataDir) throw new Error('no default data dir in Config.scala')
  const csvs = readdirSync(join(PROJECT, dataDir)).filter((f) => f.endsWith('.csv'))
  if (!csvs.length) throw new Error(`no CSV files in ${dataDir}`)
  const server = readFileSync(join(PROJECT, 'Server.scala'), 'utf8')
  const served = server.match(/Path\.of\(s"\$\{config\.outDir\}\/(date=)\$date\/([^"]+)"\)/)
  if (!served) throw new Error('Server.scala no longer serves out/date=<date>/<file>')
  const chartFile = served[2]

  return { cmd, jar, announce, gets, ok, miss, dataDir, csvs, chartFile,
           chartDir: `out/${served[1]}${ok.date}` }
}

// ── the page ────────────────────────────────────────────────────────────────────────────────────
const fontFace = (fam, weight, file) => {
  const b64 = readFileSync(join(repoDir, 'node_modules', '@fontsource', fam, 'files', file)).toString('base64')
  return `@font-face{font-family:'${fam === 'ibm-plex-mono' ? 'IBM Plex Mono' : 'IBM Plex Sans'}';`
    + `font-weight:${weight};font-style:normal;font-display:block;`
    + `src:url(data:font/woff2;base64,${b64}) format('woff2')}`
}

// The scene engine's tone palette (@graphlearning/graphl-flow 0.11), copied from its dark table —
// the card is dark in every theme, so the dark row is always the right one.
const TONE = {
  neutral: { accent: '#9aa4b2', tint: '#181b20' },
  ingest:  { accent: '#4f8ff7', tint: '#111d2e' },
  store:   { accent: '#37b877', tint: '#122419' },
  serve:   { accent: '#c98bff', tint: '#1e1428' },
  consume: { accent: '#f0656f', tint: '#2a1416' },
}

// `--brand` in src/theme.css is #f0605a, a Scala red lifted for contrast; the dark theme uses it
// exactly, so the cover and the app are the same colour. Light darkens it for a white ground.
const THEMES = {
  dark:  { badgeInk: '#12161c', bg: '#12161c', card: '#1a1d23', ink: '#ffffff', accent: '#f0605a',
           rule: 'rgba(255,255,255,.13)', glow: 'radial-gradient(125% 115% at 10% 8%, #3d1918 0%, #12161c 62%)' },
  light: { badgeInk: '#ffffff', bg: '#f6f4f3', card: '#1a1616', ink: '#1a1010', accent: '#c8302b',
           rule: 'rgba(0,0,0,.12)', glow: 'radial-gradient(120% 120% at 10% 8%, #ffffff 0%, #ece3e1 70%)' },
}

/**
 * `--mark logo` (the default): the Scala spiral, UNALTERED, with a TM — see
 * public/vendor/NOTICE-scala-logo.txt. The logo is the Scala Center's (EPFL) trademark.
 *
 * `--mark glyph`: the repo's own mark, `=>`. It is on nearly every line of a Scala pipeline
 * (lambdas, cases, function types), it is punctuation, and punctuation belongs to nobody — the
 * build that needs no one's permission.
 */
function markSvg(t, theme, mark) {
  if (mark === 'glyph') {
    const ink = theme === 'light' ? t.accent : '#ffffff'
    return `<svg class="logo glyph" viewBox="0 0 64 64" role="img" aria-label="Scala — GraphL"
      xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="${ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M 6 24 H 30 M 6 40 H 30"/>
        <path d="M 40 14 L 58 32 L 40 50"/>
      </g>
    </svg>`
  }
  const raw = readFileSync(join(repoDir, 'public', 'vendor', 'scala-spiral.svg'), 'utf8')
  const body = raw.slice(raw.indexOf('>', raw.indexOf('<svg')) + 1, raw.lastIndexOf('</svg>'))
  const vb = raw.match(/viewBox="([^"]+)"/)[1]
  return `<span class="markwrap"><svg class="logo spiral" viewBox="${vb}" role="img" aria-label="Scala"
    xmlns="http://www.w3.org/2000/svg">${body}</svg><span class="tm">&#8482;</span></span>`
}

/**
 * The pipeline the course builds — plays in, a chart out, served over HTTP — drawn from §12.4,
 * not a stock ETL picture: the folder is Config's default, the file is the one Server.scala reads,
 * the arrows are the jar's two subcommands, and the rows are what curl really got back.
 */
function pipelineSvg(s) {
  const VW = 1000, VH = 500
  const mono = 'IBM Plex Mono, monospace'
  const sans = 'IBM Plex Sans, system-ui, sans-serif'
  // Plays / chart / HTTP take the engine's ingest / store / serve tones — the same three a scene
  // uses for "what comes in", "what is kept" and "what is served".
  const IN = TONE.ingest, KEEP = TONE.store, OUT = TONE.serve, INNER = TONE.neutral

  const label = (x, y, str, { size = 27, fill = '#ffffff', weight = 600, family = sans, anchor = 'start' } = {}) =>
    `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}"
       font-family="${family}" text-anchor="${anchor}">${esc(str)}</text>`
  const box = (x, y, w, h, tone, r = 16) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${tone.tint}"
       stroke="${tone.accent}" stroke-width="2.6"/>`

  // Geometry first, so nothing can be nudged into a neighbour: three equal boxes, two equal gaps.
  const GAP = 104
  const CW = (VW - 2 * GAP) / 3
  const BH = 300, TOP = (VH - BH) / 2, MID = TOP + BH / 2
  const colX = [0, CW + GAP, 2 * (CW + GAP)]

  // The subcommand rides ABOVE the box row, where nothing else is, so it can be wider than its gap.
  const arrow = (x1, x2, text) => {
    const h = 16
    return `<line x1="${x1}" y1="${MID}" x2="${x2}" y2="${MID}" stroke="${TONE.neutral.accent}"
        stroke-width="3" opacity=".7"/>
      <polygon points="${x2},${MID} ${x2 - h},${MID - h * 0.44} ${x2 - h},${MID + h * 0.44}"
        fill="${TONE.neutral.accent}"/>
      ${label((x1 + x2) / 2, TOP - 26, text, { size: 27, family: mono, weight: 400,
        anchor: 'middle', fill: TONE.neutral.accent })}`
  }

  // Title, one subtitle, an optional inner panel of real output. Every text is SIZED to its box
  // (IBM Plex Mono advances 0.602em; Plex Sans ~0.54em at 400, ~0.6em at 600), so a longer name
  // shrinks instead of running out — the session's text is never cut to fit.
  const PAD = 22, INNER_PAD = 14
  const fit = (max, str, adv, room = CW - 2 * PAD) => Math.min(max, Math.floor(room / (adv * str.length)))
  const card = (x, tone, { title, titleFamily = mono, sub, subFamily = sans, lines = [], lineFill }) => {
    const cx = x + CW / 2
    const head = box(x, TOP, CW, BH, tone)
      + label(cx, TOP + (lines.length ? 70 : 150), title,
          { size: fit(36, title, titleFamily === mono ? 0.602 : 0.6), family: titleFamily,
            fill: tone.accent, anchor: 'middle' })
      + label(cx, TOP + (lines.length ? 112 : 194), sub,
          { size: fit(22, sub, subFamily === mono ? 0.602 : 0.54), family: subFamily, weight: 400,
            anchor: 'middle', fill: 'rgba(255,255,255,.58)' })
    if (!lines.length) return head
    const room = CW - 2 * PAD - 2 * INNER_PAD
    const size = Math.min(26, Math.floor(room / (0.602 * Math.max(...lines.map((l) => l.length)))))
    const h = lines.length > 1 ? 140 : 94
    const y0 = TOP + 150 + (h - (lines.length - 1) * 54) / 2 + size / 3
    return head + box(x + PAD, TOP + 150, CW - 2 * PAD, h, INNER, 12)
      + lines.map((l, i) => label(cx, y0 + i * 54, l,
          { size, family: mono, weight: 400, anchor: 'middle', fill: lineFill })).join('')
  }

  const plays = card(colX[0], IN, {
    title: `${s.dataDir.split('/').pop()}/`, sub: `${s.csvs.length} days of CSV`,
  })
  const chart = card(colX[1], KEEP, { title: s.chartFile, sub: s.chartDir, subFamily: mono })
  const http = card(colX[2], OUT, {
    // The status and date, not the whole path: `GET /charts/<date>` shrinks to unreadable here.
    title: 'HTTP', titleFamily: sans, sub: `${s.ok.status} · ${s.ok.date}`, subFamily: mono,
    lines: s.ok.body.slice(0, 2).map((r) => `${r.rank} ${r.title} ${r.plays}`),
    lineFill: TONE.store.accent,
  })
  const links = arrow(colX[0] + CW + 6, colX[1] - 10, 'chart')
    + arrow(colX[1] + CW + 6, colX[2] - 10, 'serve')

  return `<svg class="plot" viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg">${links}${plays}${chart}${http}</svg>`
}

function pageHtml({ serve: s, source, theme, head1, head2, badge, mark }) {
  const t = THEMES[theme]
  const fonts = [
    fontFace('ibm-plex-sans', 700, 'ibm-plex-sans-latin-700-normal.woff2'),
    fontFace('ibm-plex-sans', 600, 'ibm-plex-sans-latin-600-normal.woff2'),
    fontFace('ibm-plex-mono', 600, 'ibm-plex-mono-latin-600-normal.woff2'),
    fontFace('ibm-plex-mono', 400, 'ibm-plex-mono-latin-400-normal.woff2'),
  ].join('')

  // The `chart` source: the rows curl got back, then the date the server refused, in one grid so
  // every column lines up and nothing can collide.
  const rows = s.ok.body.map((r) => `<span class="k">${esc(r.rank)}</span>`
      + `<span class="v">${esc(r.title)}</span><span class="n">${esc(r.plays)}</span>`).join('')
    + `<span class="k" style="color:${TONE.consume.accent}">${esc(s.miss.status)}</span>`
    + `<span class="v">${esc(s.miss.date)}</span>`
    + `<span class="n" style="color:${TONE.consume.accent}">${esc(s.miss.body.error ?? '')}</span>`
  const nRows = s.ok.body.length + 1

  return `<style>
  ${fonts}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${W}px;height:${H}px;overflow:hidden}
  body{background:${t.bg};background-image:${t.glow};
       font-family:'IBM Plex Sans',system-ui,sans-serif;color:${t.ink};
       display:flex;align-items:stretch;gap:${40 * SCALE}px;padding:${46 * SCALE}px ${50 * SCALE}px}

  .left{flex:0 0 auto;max-width:${540 * SCALE}px;display:flex;flex-direction:column;justify-content:center}
  .logo{width:${96 * SCALE}px;height:${96 * SCALE}px;display:block;margin-bottom:${14 * SCALE}px;
        align-self:flex-start}
  .logo.spiral{width:auto;height:${112 * SCALE}px;margin-bottom:0}
  .markwrap{display:flex;align-items:flex-start;gap:${5 * SCALE}px;align-self:flex-start;
            margin-bottom:${18 * SCALE}px}
  .tm{font-size:${22 * SCALE}px;font-weight:600;line-height:1;
      color:${theme === 'light' ? 'rgba(0,0,0,.5)' : 'rgba(255,255,255,.55)'}}
  .h{font-weight:700;line-height:.85;letter-spacing:-.05em;font-size:${116 * SCALE}px;white-space:nowrap}
  .h2{color:${t.accent}}
  .badge{align-self:flex-start;margin-top:${26 * SCALE}px;padding:${11 * SCALE}px ${24 * SCALE}px;
         background:${t.accent};border-radius:${12 * SCALE}px;
         font-weight:700;font-size:${34 * SCALE}px;letter-spacing:.06em;color:${t.badgeInk}}

  .card{flex:1;min-width:0;background:${t.card};border:${1 * SCALE}px solid ${t.rule};
        border-radius:${18 * SCALE}px;padding:${26 * SCALE}px ${30 * SCALE}px ${24 * SCALE}px;
        display:flex;flex-direction:column;box-shadow:0 ${22 * SCALE}px ${64 * SCALE}px rgba(0,0,0,.5)}
  .dots{display:flex;gap:${9 * SCALE}px;margin-bottom:${16 * SCALE}px}
  .dots i{width:${13 * SCALE}px;height:${13 * SCALE}px;border-radius:50%}
  .cmd{font-family:'IBM Plex Mono',monospace;font-size:${25 * SCALE}px;color:rgba(255,255,255,.62);
       margin-bottom:${16 * SCALE}px;white-space:nowrap}
  .cmd b{color:#6ee787;font-weight:400}

  .stat{font-family:'IBM Plex Mono',monospace;font-weight:600;color:#fff;
        font-size:${40 * SCALE}px;letter-spacing:-.02em;white-space:nowrap}
  .stat em{font-style:normal;color:${t.accent}}
  .statsub{font-family:'IBM Plex Mono',monospace;font-size:${25 * SCALE}px;
           color:rgba(255,255,255,.55);margin-top:${6 * SCALE}px;white-space:nowrap}

  .rows{flex:1;display:grid;align-content:center;grid-template-columns:auto 1fr auto;
        column-gap:${24 * SCALE}px;row-gap:${22 * SCALE}px;
        font-family:'IBM Plex Mono',monospace;font-weight:600;
        font-size:${(nRows <= 3 ? 38 : 32) * SCALE}px;color:#fff}
  .k{color:${t.accent};white-space:nowrap}
  .v{color:rgba(255,255,255,.88);letter-spacing:-.02em;white-space:nowrap}
  .n{text-align:right;white-space:nowrap;color:rgba(255,255,255,.9)}
  .foot{font-family:'IBM Plex Mono',monospace;font-size:${23 * SCALE}px;white-space:nowrap;
        color:rgba(255,255,255,.4);letter-spacing:.04em}
  .plotwrap{flex:1;min-height:0;display:flex;margin:${14 * SCALE}px 0 ${10 * SCALE}px}
  .plot{width:100%;height:100%;display:block;overflow:visible}
</style>
<div class="left">
  ${markSvg(t, theme, mark)}
  <div class="h">${esc(head1)}</div>
  ${head2.split(/\s+/).map((w) => `<div class="h h2">${esc(w)}</div>`).join('')}
  <div class="badge">${esc(badge)}</div>
</div>
<div class="card">
  <div class="dots"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i></div>
  ${source === 'pipeline'
    ? `<div class="cmd">$ <b>${esc(s.cmd)}</b></div>
       <div class="stat"><em>CSV</em> → <em>${esc(s.jar)}</em> → HTTP</div>
       <div class="statsub">${esc(s.announce)}</div>
       <div class="plotwrap">${pipelineSvg(s)}</div>
       <div class="foot">standard library only · one jar · real answers</div>`
    : `<div class="cmd">$ <b>curl -s localhost:8080${esc(s.ok.path)}</b></div>
       <div class="stat">top tracks · <em>${esc(s.ok.date)}</em></div>
       <div class="statsub">GET ${esc(s.ok.path)}: ${esc(s.ok.status)}</div>
       <div class="rows">${rows}</div>
       <div class="foot">the pipeline you build · charts over HTTP</div>`}
</div>`
}

// ── render ──────────────────────────────────────────────────────────────────────────────────────
async function main() {
  const argv = process.argv.slice(2)
  const opt = { theme: 'dark', out: 'output/thumbnails/film.png', source: 'pipeline',
                head1: 'LEARN', head2: 'SCALA', badge: 'FULL COURSE', mark: 'logo' }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--theme') opt.theme = argv[++i]
    else if (a === '--out') opt.out = argv[++i]
    else if (a === '--head1') opt.head1 = argv[++i]
    else if (a === '--head2') opt.head2 = argv[++i]
    else if (a === '--badge') opt.badge = argv[++i]
    else if (a === '--source') opt.source = argv[++i]
    else if (a === '--mark') opt.mark = argv[++i]
    else { console.error(`unknown argument: ${a}`); process.exit(2) }
  }
  if (!THEMES[opt.theme]) { console.error(`unknown theme: ${opt.theme} (have: ${Object.keys(THEMES).join(', ')})`); process.exit(2) }
  if (!['logo', 'glyph'].includes(opt.mark)) {
    console.error(`unknown mark: ${opt.mark} (have: logo, glyph)`); process.exit(2)
  }
  if (!['pipeline', 'chart'].includes(opt.source)) {
    console.error(`unknown source: ${opt.source} (have: pipeline, chart)`); process.exit(2)
  }

  const serve = realServe()
  // The `chart` card shows curl's own command; it must be in the session exactly as shown.
  if (!readFileSync(SESSION, 'utf8').includes(`curl -s localhost:8080${serve.ok.path}`)) {
    throw new Error(`no \`curl -s localhost:8080${serve.ok.path}\` in the session`)
  }
  console.log(`Real pipeline from spine: $ ${serve.cmd}`)
  console.log(`  ${serve.announce}`)
  console.log(`  ${serve.dataDir}: ${serve.csvs.join(', ')} → ${serve.chartDir}/${serve.chartFile}`)
  for (const g of serve.gets) console.log(`  GET ${g.path}: ${g.status}  ${JSON.stringify(g.body).slice(0, 90)}`)

  const requireFromRepo = createRequire(join(repoDir, 'package.json'))
  const { default: puppeteer } = await import(pathToFileURL(requireFromRepo.resolve('puppeteer')).href)

  const browser = await puppeteer.launch({ headless: true,
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 }, args: [`--window-size=${W},${H}`] })
  try {
    const page = await browser.newPage()
    await page.setContent(pageHtml({ serve, ...opt }), { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    // The real command must appear in full — never truncated — so fit it by shrinking, not cutting.
    await page.evaluate(() => {
      for (const el of document.querySelectorAll('.h,.cmd,.stat,.statsub,.foot,.rows')) {
        const room = el.clientWidth - 1        // the element's OWN content box
        if (el.scrollWidth <= room) continue   // already fits — leave it alone
        const px = parseFloat(getComputedStyle(el).fontSize)
        // one bounded step, never a loop: a loop can chase a width that moves with the font
        el.style.fontSize = `${Math.max(10, Math.floor(px * (room / el.scrollWidth) * 0.98))}px`
      }
    })
    await sleep(250)

    // A thumbnail that silently clips its own text is worse than one that fails loudly.
    const overflow = await page.evaluate(() => {
      const bad = []
      for (const sel of ['.rows', '.card', '.left', 'body']) {
        const el = document.querySelector(sel)
        if (el && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) {
          bad.push(`${sel} ${el.scrollWidth}x${el.scrollHeight} > ${el.clientWidth}x${el.clientHeight}`)
        }
      }
      for (const el of document.querySelectorAll('.k,.v,.n,.cmd,.h,.badge,.stat,.statsub')) {
        const r = el.getBoundingClientRect()
        if (r.right > window.innerWidth + 1 || r.bottom > window.innerHeight + 1) {
          bad.push(`clipped: "${el.textContent.trim().slice(0, 20)}" right=${Math.round(r.right)}`)
        }
      }
      return bad
    })
    if (overflow.length) throw new Error(`layout overflows:\n  ${overflow.join('\n  ')}`)

    const out = isAbsolute(opt.out) ? opt.out : join(repoDir, opt.out)
    mkdirSync(dirname(out), { recursive: true })
    const big = join(tmpdir(), `thumb-film-${Date.now()}.png`)
    await page.screenshot({ path: big })
    await run(FFMPEG, ['-y', '-loglevel', 'error', '-i', big, '-vf', 'scale=1280:720:flags=lanczos', out])
    rmSync(big, { force: true })
    console.log(`\n✅ ${out}  (${opt.theme}, ${opt.source}, ${opt.mark})`)
  } finally {
    await browser.close()
  }
}

main().catch((e) => { console.error('\n✗', e.message); process.exit(1) })
