// Reconstructed generator for the ZPM_COMPRESS_STORE disk chart (zpm#317).
// The prior source was lost; this rebuilds it in the napi-rs gen-charts.mjs
// style (GitHub-dark, inline-code tokens) from the numbers in zpm-compress-store-v4.png,
// with extra BOTTOM padding so the 3-line footer clears the card border with
// breathing room (the v4 overflow).
//   node gen-zpm-compress-store.mjs   # writes zpm-compress-store.svg here
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))

const C = {
  bg: '#0d1117',
  border: '#30363d',
  ink: '#e6edf3',
  muted: '#8b949e',
  faint: '#6e7681',
  grid: '#21262d',
  raw: '#8b949e',
  rawFill: '#c9d1d9',
  blue: '#2f6bff',
  green: '#3fb950',
  code: '#79c0ff',
  codeBg: '#1f2733',
}
const MONO = "ui-monospace, 'SF Mono', Menlo, 'DejaVu Sans Mono', monospace"
const SANS = "-apple-system, 'Helvetica Neue', Arial, 'DejaVu Sans', sans-serif"

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function text(x, y, s, o = {}) {
  const { size = 15, fill = C.muted, weight = 'normal', font = SANS, anchor = 'start' } = o
  return `<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`
}

function rect(x, y, w, h, fill, rx = 4) {
  return `<rect x="${x}" y="${y}" width="${Math.max(0, w)}" height="${h}" rx="${rx}" fill="${fill}"/>`
}

// A prose line mixing normal runs with pill-style inline-code tokens.
// Advance widths are per-glyph estimates for the fonts below: mono ~0.6em,
// sans ~0.505em, bold sans ~0.545em. Kept slightly generous so runs never
// overlap the next token.
function rich(x, y, parts, size, fill, weight = 'normal') {
  let cx = x
  const out = []
  for (const p of parts) {
    if (p.code) {
      const tw = p.t.length * size * 0.6
      const w = tw + size * 0.6
      out.push(`<rect x="${cx.toFixed(1)}" y="${(y - size + 1).toFixed(1)}" width="${w.toFixed(1)}" height="${(size + 6).toFixed(1)}" rx="4" fill="${C.codeBg}"/>`)
      out.push(`<text x="${(cx + size * 0.3).toFixed(1)}" y="${y}" font-family="${MONO}" font-size="${size}" fill="${C.code}">${esc(p.t)}</text>`)
      cx += w + size * 0.18
    } else {
      out.push(`<text x="${cx.toFixed(1)}" y="${y}" font-family="${SANS}" font-size="${size}" font-weight="${p.b ? 'bold' : weight}" fill="${p.b ? C.ink : fill}">${esc(p.t)}</text>`)
      cx += p.t.length * size * (p.b ? 0.545 : 0.505)
    }
  }
  return out.join('')
}

function frame(w, h, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="20" fill="${C.bg}" stroke="${C.border}" stroke-width="2"/>
${inner}
</svg>`
}

const W = 1216
const PAD = 52
const out = []

// ── title ──────────────────────────────────────────────────────────────────
out.push(rect(PAD, 44, 232, 40, C.codeBg, 8))
out.push(text(PAD + 16, 72, 'ZPM_COMPRESS_STORE', { size: 22, fill: C.ink, weight: 'bold', font: MONO }))
out.push(text(PAD + 262, 74, '— native addons take ~60% less disk', { size: 30, fill: C.ink, weight: 'bold' }))

// ── subtitle (3 wrapped lines) ───────────────────────────────────────────────
const sub = [
  [{ t: 'Turn it on and zpm stores native addons (' }, { t: '.node', code: 1 }, { t: ' files) with the operating system’s own ' }, { t: 'transparent filesystem compression', b: 1 }, { t: ' (APFS' }],
  [{ t: 'here). The bytes any program reads are identical and load speed is unchanged — the kernel decompresses on read. Measured on darwin-' }],
  [{ t: 'arm64; lower is better.' }],
]
let sy = 116
for (const line of sub) {
  out.push(rich(PAD, sy, line, 16, C.muted))
  sy += 26
}

// ── legend ───────────────────────────────────────────────────────────────────
const legY = 214
out.push(rect(PAD, legY - 13, 16, 16, C.rawFill, 3))
out.push(text(PAD + 24, legY, 'uncompressed (on disk today)', { size: 16, fill: C.muted }))
out.push(rect(PAD + 330, legY - 13, 16, 16, C.blue, 3))
out.push(text(PAD + 354, legY, 'compressed in the store', { size: 16, fill: C.muted }))

// ── bars ──────────────────────────────────────────────────────────────────────
const rows = [
  { name: 'vite', raw: 23.7, comp: 10.8, pct: 54, indent: 0, bold: 1 },
  { name: '@rolldown/binding', raw: 15.6, comp: 7.3, pct: 53, indent: 1 },
  { name: 'lightningcss-*', raw: 8.1, comp: 3.5, pct: 56, indent: 1 },
  { name: '@next/swc', raw: 116.1, comp: 42.7, pct: 63, indent: 0 },
  { name: '@rspack/binding', raw: 39.4, comp: 18.1, pct: 54, indent: 0 },
  { name: '@swc/core', raw: 24.6, comp: 11.0, pct: 55, indent: 0 },
  { name: '@nx/nx', raw: 16.8, comp: 7.7, pct: 54, indent: 0 },
]
const bx = 340
const bw = 540
const axisMax = 150
const sc = bw / axisMax
const rowH = 30
const rowGap = 20
let y = 262
const barTops = []
for (const r of rows) {
  const cy = y
  barTops.push(cy)
  out.push(text(PAD + (r.indent ? 40 : 0), cy + rowH * 0.7, r.name, { size: 16, fill: r.indent ? C.muted : C.ink, weight: r.bold ? 'bold' : 'normal', font: MONO }))
  out.push(rect(bx, cy, r.raw * sc, rowH, C.rawFill))
  out.push(rect(bx, cy, r.comp * sc, rowH, C.blue))
  const noteX = bx + r.raw * sc + 14
  const noteStr = `${r.raw} → ${r.comp} MiB`
  out.push(text(noteX, cy + rowH * 0.7, noteStr, { size: 16, fill: C.ink, weight: 'bold', font: MONO }))
  out.push(text(noteX + noteStr.length * 9.7 + 12, cy + rowH * 0.7, `−${r.pct}%`, { size: 16, fill: C.green, weight: 'bold', font: MONO }))
  y += rowH + rowGap
}

// indent bracket for the vite children
out.push(`<line x1="${PAD + 12}" y1="${barTops[1] - 2}" x2="${PAD + 12}" y2="${barTops[2] + rowH + 2}" stroke="${C.grid}" stroke-width="2"/>`)

// ── axis ───────────────────────────────────────────────────────────────────────
const axisY = y + 6
for (let t = 0; t <= axisMax; t += 50) {
  const gx = bx + t * sc
  out.push(`<line x1="${gx}" y1="252" x2="${gx}" y2="${axisY}" stroke="${C.grid}" stroke-width="1"/>`)
  out.push(text(gx, axisY + 24, t === axisMax ? `${t} MiB` : String(t), { size: 14, fill: C.faint, anchor: t === axisMax ? 'end' : 'middle' }))
}

// ── footer rule + explainer (this is the block that overflowed in v4) ─────────
const ruleY = axisY + 44
out.push(`<line x1="${PAD}" y1="${ruleY}" x2="${W - PAD}" y2="${ruleY}" stroke="${C.grid}" stroke-width="1"/>`)
const foot = [
  [{ t: 'These six addons together: 221 → 90 MiB on disk (−59%).', b: 1 }, { t: ' The store links each entry into every project by reflink/hardlink, so it’s compressed once' }],
  [{ t: 'and shared everywhere. On a filesystem that can’t compress (ext4, most network mounts) it falls back to a normal write — a file always lands. Latest' }],
  [{ t: 'releases, measured with the ' }, { t: 'decmpfs', code: 1 }, { t: ' crate on APFS: @next/swc 16.2.10, @rspack/binding 2.1.3, @swc/core 1.15.43, @nx/nx 23.0.1, @rolldown/binding' }],
  [{ t: '1.1.4, lightningcss 1.32.0.' }],
]
let fy = ruleY + 30
for (const line of foot) {
  out.push(rich(PAD, fy, line, 15.5, C.muted))
  fy += 24
}

// Frame height = last footer baseline + generous bottom breathing room.
const H = Math.round(fy - 24 + 34)
writeFileSync(join(here, 'zpm-compress-store.svg'), frame(W, H, out.join('\n')))
console.log(`wrote zpm-compress-store.svg (${W}x${H})`)
