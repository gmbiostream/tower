/**
 * High-fidelity Vector SVG Sprites for Cyber-Immunology TD.
 * Generated from organic biological cellular electron-microscopy structures.
 */

export function getAtpIconSvg(size = 24): string {
  return `
    <svg viewBox="0 0 120 120" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="inline-block select-none pointer-events-none">
      <defs>
        <radialGradient id="atp-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#ffea00" stop-opacity="0.5"/>
          <stop offset="100%" stop-color="#ff9100" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="atp-ring" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fff9c4"/>
          <stop offset="40%" stop-color="#f9a825"/>
          <stop offset="100%" stop-color="#e65100"/>
        </radialGradient>
        <radialGradient id="atp-P" cx="38%" cy="32%" r="68%">
          <stop offset="0%" stop-color="#fff9c4"/>
          <stop offset="45%" stop-color="#ffca28"/>
          <stop offset="100%" stop-color="#f57f17"/>
        </radialGradient>
      </defs>
      <circle cx="60" cy="60" r="56" fill="url(#atp-bg)"/>
      <!-- High energy phosphate chain -->
      <path d="M72,60 Q76,55 82,60" stroke="#ff9100" stroke-width="2.5" fill="none"/>
      <path d="M88,55 Q91,49 96,52" stroke="#ff9100" stroke-width="2.5" fill="none"/>
      <path d="M102,47 Q105,41 110,44" stroke="#ff9100" stroke-width="2.5" fill="none"/>
      <!-- Phosphates -->
      <g>
        <circle cx="82" cy="60" r="7.5" fill="url(#atp-P)" stroke="#ffca28" stroke-width="1"/>
        <text x="82" y="63" text-anchor="middle" fill="#3e2000" font-size="7" font-family="'Share Tech Mono',monospace" font-weight="bold">P</text>
        <circle cx="96" cy="52" r="7" fill="url(#atp-P)" stroke="#ffca28" stroke-width="1"/>
        <text x="96" y="55" text-anchor="middle" fill="#3e2000" font-size="7" font-family="'Share Tech Mono',monospace" font-weight="bold">P</text>
        <circle cx="110" cy="44" r="6.5" fill="url(#atp-P)" stroke="#ffca28" stroke-width="1"/>
        <text x="110" y="47" text-anchor="middle" fill="#3e2000" font-size="7" font-family="'Share Tech Mono',monospace" font-weight="bold">P</text>
      </g>
      <!-- Ribose & Adenine Base -->
      <ellipse cx="60" cy="70" rx="10" ry="8" fill="#e65100" stroke="#ffca28" stroke-width="0.8" opacity="0.7"/>
      <polygon points="46,60 50,48 62,48 68,60 62,72 50,72" fill="url(#atp-ring)" stroke="#ffca28" stroke-width="1.2"/>
      <polygon points="62,56 70,52 74,62 68,70" fill="#f57f17" stroke="#ffca28" stroke-width="1"/>
      <!-- Center high-energy spark bolt -->
      <polygon points="56,47 51,61 58,61 54,75 66,58 59,58" fill="#ffffff" stroke="#ffea00" stroke-width="0.8"/>
    </svg>
  `;
}

/** Compatibility aliases used by HUD integrations. */
export const getATPIconSvg = getAtpIconSvg;

function spriteSvg(size: number, body: string, defs = ''): string {
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none">${defs}${body}</svg>`;
}

// ---------------------------------------------------------------------------
// Organic cell geometry helpers (ported from the reference sprite cellUtils).
// ---------------------------------------------------------------------------

export interface Fiber {
  sx: number; sy: number;
  cpx: number; cpy: number;
  ex: number; ey: number;
  w: number; op: number; angle: number;
}

/** Dense tangled curved fibers; curliness drives tangential arc (tangled mesh vs clean spikes). */
export function makeFibers(
  cx: number, cy: number, baseR: number, count: number,
  minLen: number, maxLen: number, minW: number, maxW: number,
  curliness: number, offset = 0
): Fiber[] {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + offset + Math.sin(i * 1.618) * 0.28;
    const len = minLen + Math.abs(Math.sin(i * 2.1 + 0.5)) * (maxLen - minLen)
              + Math.abs(Math.cos(i * 3.3)) * (maxLen - minLen) * 0.3;
    const curl = Math.sin(i * 4.1 + 0.7) * curliness;
    const sx = cx + Math.cos(a) * baseR;
    const sy = cy + Math.sin(a) * baseR;
    const cpx = cx + Math.cos(a + curl * 0.5) * (baseR + len * 0.58);
    const cpy = cy + Math.sin(a + curl * 0.5) * (baseR + len * 0.58);
    const ex = cx + Math.cos(a + curl) * (baseR + len);
    const ey = cy + Math.sin(a + curl) * (baseR + len);
    const w = minW + Math.abs(Math.sin(i * 1.4 + 0.3)) * (maxW - minW);
    const op = 0.38 + Math.abs(Math.sin(i * 2.9 + 1.1)) * 0.55;
    return { sx, sy, cpx, cpy, ex, ey, w, op, angle: a };
  });
}

/** Smooth organic blob path using midpoint quadratic beziers. */
export function smoothBlob(cx: number, cy: number, radii: number[]): string {
  const n = radii.length;
  const pts = radii.map((r, i) => ({
    x: cx + Math.cos((i / n) * Math.PI * 2) * r,
    y: cy + Math.sin((i / n) * Math.PI * 2) * r,
  }));
  let d = `M${((pts[0]!.x + pts[n - 1]!.x) / 2).toFixed(1)},${((pts[0]!.y + pts[n - 1]!.y) / 2).toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const curr = pts[i]!;
    const next = pts[(i + 1) % n]!;
    const mx = (curr.x + next.x) / 2;
    const my = (curr.y + next.y) / 2;
    d += ` Q${curr.x.toFixed(1)},${curr.y.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
  }
  return d + 'Z';
}

/** Long curving pseudopod path — single arm, tapers to a point. */
export function pseudopod(
  cx: number, cy: number, angle: number, startR: number,
  length: number, curlOffset: number
): string {
  const sx = cx + Math.cos(angle) * startR;
  const sy = cy + Math.sin(angle) * startR;
  const cp1x = cx + Math.cos(angle + curlOffset * 0.3) * (startR + length * 0.35);
  const cp1y = cy + Math.sin(angle + curlOffset * 0.3) * (startR + length * 0.35);
  const cp2x = cx + Math.cos(angle + curlOffset * 0.7) * (startR + length * 0.7);
  const cp2y = cy + Math.sin(angle + curlOffset * 0.7) * (startR + length * 0.7);
  const ex = cx + Math.cos(angle + curlOffset) * (startR + length);
  const ey = cy + Math.sin(angle + curlOffset) * (startR + length);
  return `M${sx.toFixed(1)},${sy.toFixed(1)} C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
}

function fiberPath(f: Fiber): string {
  return `M${f.sx.toFixed(1)},${f.sy.toFixed(1)} Q${f.cpx.toFixed(1)},${f.cpy.toFixed(1)} ${f.ex.toFixed(1)},${f.ey.toFixed(1)}`;
}

function fiberGroup(fibers: Fiber[], colorFor: (i: number) => string, wScale = 1, opScale = 1, extra = ''): string {
  return `<g fill="none" stroke-linecap="round" ${extra}>${fibers
    .map((f, i) => `<path d="${fiberPath(f)}" stroke="${colorFor(i)}" stroke-width="${(f.w * wScale).toFixed(2)}" opacity="${(f.op * opScale).toFixed(2)}"/>`)
    .join('')}</g>`;
}

function glowFilter(id: string, std: number): string {
  return `<filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${std}" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
}

function cellSvg(size: number, defs: string, body: string): string {
  return `<svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none"><defs>${defs}</defs>${body}</svg>`;
}

/** Shared palette so the canvas renderer and field manual agree on each pathogen's look. */
export const ENEMY_PALETTES: Record<string, { base: string; light: string; dark: string; accent: string }> = {
  RHINOVIRUS: { base: '#e91e63', light: '#f48fb1', dark: '#6a0032', accent: '#fce4ec' },
  INFLUENZA: { base: '#e64a19', light: '#ffab40', dark: '#6a0000', accent: '#ff7043' },
  CORONA_TITAN: { base: '#3949ab', light: '#9fa8da', dark: '#0d1460', accent: '#e53935' },
  HEATSHOCK_CARRIER: { base: '#ef5350', light: '#eceff1', dark: '#4a0a0a', accent: '#b0bec5' },
  RETRO_MUTANT: { base: '#ff9100', light: '#ffff8d', dark: '#6a1000', accent: '#ffffff' },
};

const CX = 100;
const CY = 100;

/** Acute Pathogen — dense tangled crimson fibrous amoeba with long trailing pseudopods. */
function acutePathogenSvg(size: number): string {
  const bodyRadii = [52,60,46,64,55,70,47,62,53,67,48,59,44,65,56,72,49,61,54,68,50,63,47,62,53,66];
  const innerRadii = [32,37,29,40,34,43,29,38,33,41,30,36,28,40,35,44,30,38,33,41,31,39,29,38,32,40];
  const back = makeFibers(CX, CY, 52, 65, 5, 25, 0.35, 1.6, 0.68, 0.08);
  const mid = makeFibers(CX, CY, 48, 45, 3, 15, 0.4, 1.2, 0.55, 0.35);
  const front = makeFibers(CX, CY, 52, 32, 3, 12, 0.45, 1.1, 0.42, 0.6);
  const podSpecs: [number, number, number][] = [[0.4, 45, 0.5], [1.2, 55, -0.2], [3.0, 40, 0.45], [4.5, 50, -0.38], [5.8, 38, 0.3]];
  const pods = podSpecs.map(([a, len, curl]) => pseudopod(CX, CY, a, 65, len, curl));
  const defs = `
    <radialGradient id="ap-bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#e91e63" stop-opacity="0.45"/><stop offset="100%" stop-color="#880e4f" stop-opacity="0"/></radialGradient>
    <radialGradient id="ap-body" cx="35%" cy="30%" r="72%"><stop offset="0%" stop-color="#fce4ec"/><stop offset="12%" stop-color="#f48fb1"/><stop offset="32%" stop-color="#e91e63"/><stop offset="56%" stop-color="#ad1457"/><stop offset="78%" stop-color="#6a0032"/><stop offset="100%" stop-color="#280012"/></radialGradient>
    <radialGradient id="ap-inner" cx="45%" cy="40%" r="58%"><stop offset="0%" stop-color="#f8bbd0" stop-opacity="0.5"/><stop offset="50%" stop-color="#c2185b" stop-opacity="0.25"/><stop offset="100%" stop-color="#880e4f" stop-opacity="0.05"/></radialGradient>
    <radialGradient id="ap-nuc" cx="38%" cy="34%" r="68%"><stop offset="0%" stop-color="#fce4ec"/><stop offset="35%" stop-color="#e91e63"/><stop offset="100%" stop-color="#280012"/></radialGradient>
    ${glowFilter('ap-glow', 9)}`;
  const body = `
    <circle cx="${CX}" cy="${CY}" r="90" fill="url(#ap-bg)"/>
    <g stroke-linecap="round" fill="none">${pods.map((d, i) => `<path d="${d}" stroke="${i === 0 ? '#f06292' : i === 1 ? '#e91e63' : '#c2185b'}" stroke-width="${(1.2 - i * 0.1).toFixed(2)}" opacity="${(0.55 - i * 0.04).toFixed(2)}"/>`).join('')}</g>
    ${fiberGroup(back, (i) => (i % 5 === 0 ? '#fce4ec' : i % 3 === 0 ? '#f48fb1' : '#e91e63'), 0.65, 0.5)}
    <path d="${smoothBlob(CX, CY, bodyRadii)}" fill="url(#ap-body)" filter="url(#ap-glow)"/>
    <path d="${smoothBlob(CX, CY, innerRadii)}" fill="url(#ap-inner)"/>
    ${fiberGroup(mid.filter((_, i) => i % 2 === 0), () => '#f48fb1', 0.5, 0.25)}
    <path d="${smoothBlob(CX + 4, CY + 6, [15,17,14,16,15,18,14,16,15,17,14,16,15,17,14,16])}" fill="url(#ap-nuc)" opacity="0.78"/>
    <ellipse cx="${CX}" cy="${CY + 3}" rx="6" ry="5" fill="white" opacity="0.2"/>
    ${fiberGroup(front, (i) => (i % 4 === 0 ? '#fce4ec' : i % 3 === 0 ? '#f48fb1' : i % 5 === 0 ? '#ffffff' : '#e91e63'))}
    <ellipse cx="${CX - 20}" cy="${CY - 26}" rx="14" ry="6" fill="white" opacity="0.12" transform="rotate(-30,${CX - 20},${CY - 26})"/>`;
  return cellSvg(size, defs, body);
}

/** Viral Agent — orange/red coronavirus with bulbous spike proteins over a fibrous surface. */
function viralAgentSvg(size: number): string {
  const bodyRadii = [40,44,38,42,41,45,37,42,40,44,38,41,40,44,38,43,40,44,38,42,39,43,40,44];
  const innerRadii = [24,27,23,26,24,28,22,25,24,27,22,26,24,27,23,26,24,27];
  const back = makeFibers(CX, CY, 40, 42, 4, 18, 0.4, 1.4, 0.52, 0.12);
  const front = makeFibers(CX, CY, 40, 28, 3, 10, 0.45, 1.1, 0.38, 0.5);
  const spikes = Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2 + 0.15;
    const stemLen = 16 + Math.abs(Math.sin(i * 2.3)) * 12;
    const tipR = 5 + Math.abs(Math.sin(i * 3.1)) * 3.5;
    const sw = 2.2 + Math.abs(Math.sin(i * 1.7)) * 1.5;
    return { a, sx: CX + Math.cos(a) * 40, sy: CY + Math.sin(a) * 40, tx: CX + Math.cos(a) * (40 + stemLen), ty: CY + Math.sin(a) * (40 + stemLen), tipR, sw };
  });
  const podSpecs: [number, number, number][] = [[0.7, 36, 0.42], [2.3, 42, -0.38], [4.2, 32, 0.35], [5.6, 38, -0.44]];
  const pods = podSpecs.map(([a, len, curl]) => pseudopod(CX, CY, a, 43, len, curl));
  const defs = `
    <radialGradient id="va-bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ff6d00" stop-opacity="0.45"/><stop offset="100%" stop-color="#bf360c" stop-opacity="0"/></radialGradient>
    <radialGradient id="va-body" cx="38%" cy="32%" r="68%"><stop offset="0%" stop-color="#fff3e0"/><stop offset="14%" stop-color="#ffab40"/><stop offset="38%" stop-color="#e64a19"/><stop offset="64%" stop-color="#b71c1c"/><stop offset="86%" stop-color="#6a0000"/><stop offset="100%" stop-color="#2a0000"/></radialGradient>
    <radialGradient id="va-inner" cx="44%" cy="40%" r="58%"><stop offset="0%" stop-color="#ff8f00" stop-opacity="0.45"/><stop offset="50%" stop-color="#e64a19" stop-opacity="0.2"/><stop offset="100%" stop-color="#b71c1c" stop-opacity="0"/></radialGradient>
    <radialGradient id="va-nuc" cx="40%" cy="36%" r="64%"><stop offset="0%" stop-color="#fff3e0"/><stop offset="38%" stop-color="#ff6d00"/><stop offset="100%" stop-color="#2a0000"/></radialGradient>
    <radialGradient id="va-spike" cx="40%" cy="20%" r="80%"><stop offset="0%" stop-color="#ffccbc"/><stop offset="55%" stop-color="#ff7043"/><stop offset="100%" stop-color="#bf360c"/></radialGradient>
    ${glowFilter('va-glow', 9)}`;
  const spikeSvg = (s: typeof spikes[number], back: boolean) => back
    ? `<g opacity="0.55"><line x1="${s.sx.toFixed(1)}" y1="${s.sy.toFixed(1)}" x2="${s.tx.toFixed(1)}" y2="${s.ty.toFixed(1)}" stroke="#bf360c" stroke-width="${(s.sw * 0.7).toFixed(2)}" stroke-linecap="round"/><circle cx="${s.tx.toFixed(1)}" cy="${s.ty.toFixed(1)}" r="${(s.tipR * 0.75).toFixed(1)}" fill="#bf360c"/></g>`
    : `<g opacity="0.9"><line x1="${s.sx.toFixed(1)}" y1="${s.sy.toFixed(1)}" x2="${s.tx.toFixed(1)}" y2="${s.ty.toFixed(1)}" stroke="#ff7043" stroke-width="${(s.sw * 0.65).toFixed(2)}" stroke-linecap="round"/><circle cx="${s.tx.toFixed(1)}" cy="${s.ty.toFixed(1)}" r="${s.tipR.toFixed(1)}" fill="url(#va-spike)"/><circle cx="${(s.tx - Math.cos(s.a) * s.tipR * 0.35).toFixed(1)}" cy="${(s.ty - Math.sin(s.a) * s.tipR * 0.35).toFixed(1)}" r="${(s.tipR * 0.28).toFixed(1)}" fill="white" opacity="0.3"/></g>`;
  const body = `
    <circle cx="${CX}" cy="${CY}" r="88" fill="url(#va-bg)"/>
    <g stroke="#ff7043" stroke-linecap="round" fill="none" opacity="0.5">${pods.map((d, i) => `<path d="${d}" stroke-width="${(1.1 - i * 0.08).toFixed(2)}"/>`).join('')}</g>
    ${fiberGroup(back, (i) => (i % 4 === 0 ? '#ffccbc' : i % 3 === 0 ? '#ff8a65' : '#ff7043'), 0.7, 0.5)}
    ${spikes.filter((_, i) => i % 2 === 0).map((s) => spikeSvg(s, true)).join('')}
    <path d="${smoothBlob(CX, CY, bodyRadii)}" fill="url(#va-body)" filter="url(#va-glow)"/>
    <path d="${smoothBlob(CX, CY, innerRadii)}" fill="url(#va-inner)"/>
    <path d="M${CX - 18},${CY + 8} C${CX - 8},${CY - 14} ${CX + 8},${CY + 16} ${CX + 20},${CY - 8}" fill="none" stroke="#ffccbc" stroke-width="1.2" opacity="0.25" stroke-linecap="round" stroke-dasharray="2 3"/>
    <path d="M${CX - 18},${CY - 8} C${CX - 8},${CY + 14} ${CX + 8},${CY - 16} ${CX + 20},${CY + 8}" fill="none" stroke="#ffccbc" stroke-width="1.2" opacity="0.25" stroke-linecap="round" stroke-dasharray="2 3"/>
    <path d="${smoothBlob(CX, CY + 2, [12,14,11,13,12,15,11,13,12,14,11,13,12,14])}" fill="url(#va-nuc)" opacity="0.8"/>
    ${spikes.filter((_, i) => i % 2 === 1).map((s) => spikeSvg(s, false)).join('')}
    ${fiberGroup(front, (i) => (i % 4 === 0 ? '#fff3e0' : i % 3 === 0 ? '#ffab40' : '#ff7043'))}
    <ellipse cx="${CX - 12}" cy="${CY - 16}" rx="11" ry="6" fill="white" opacity="0.13" transform="rotate(-35,${CX - 12},${CY - 16})"/>`;
  return cellSvg(size, defs, body);
}

/** Armored Virus — blue-purple lumpy capsid, receptor stubs, red inner core glowing through. */
function armoredVirusSvg(size: number): string {
  const bodyRadii = [54,56,52,55,54,57,52,55,53,56,52,55,54,57,52,55,53,56,52,55,54,56,52,55,53,56,52,55,54,57,52,55,54,56];
  const innerRadii = [32,34,30,33,32,35,30,33,31,34,30,33,32,34,30,33,31,34];
  const lumps = Array.from({ length: 20 }, (_, i) => {
    const a = (i / 20) * Math.PI * 2 + 0.18;
    const r = 44 + Math.sin(i * 2.1) * 4;
    const sz = 10 + Math.abs(Math.sin(i * 3.3)) * 5;
    return { lx: CX + Math.cos(a) * r, ly: CY + Math.sin(a) * r, a, sz };
  });
  const stubs = (l: typeof lumps[number], front: boolean) =>
    Array.from({ length: 7 }, (_, j) => {
      const sa = l.a + (j - 3) * 0.22;
      const r1 = l.sz + 1;
      const r2 = l.sz + 5 + Math.abs(Math.sin(j * 1.7)) * 3;
      const ex = l.lx + Math.cos(sa) * r2;
      const ey = l.ly + Math.sin(sa) * r2;
      return `<line x1="${(l.lx + Math.cos(sa) * r1).toFixed(1)}" y1="${(l.ly + Math.sin(sa) * r1).toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}"/>${front ? `<circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="1.2" fill="#c5cae9" stroke="none"/>` : ''}`;
    }).join('');
  const lumpSvg = (l: typeof lumps[number], front: boolean) => `
    <g opacity="${front ? 0.9 : 0.65}">
      <circle cx="${l.lx.toFixed(1)}" cy="${l.ly.toFixed(1)}" r="${l.sz.toFixed(1)}" fill="url(#av-lump)" stroke="${front ? '#9fa8da' : '#3f51b5'}" stroke-width="${front ? 0.6 : 0.5}"/>
      <g stroke="${front ? '#9fa8da' : '#7986cb'}" stroke-linecap="round" stroke-width="${front ? 1.5 : 1.2}" fill="none" opacity="${front ? 0.75 : 0.6}">${stubs(l, front)}</g>
      ${front ? `<circle cx="${(l.lx - l.sz * 0.35).toFixed(1)}" cy="${(l.ly - l.sz * 0.35).toFixed(1)}" r="${(l.sz * 0.22).toFixed(1)}" fill="white" opacity="0.3"/>` : ''}
    </g>`;
  const hex = (r: number) => Array.from({ length: 6 }, (_, i) => `${(CX + Math.cos((i / 6) * Math.PI * 2) * r).toFixed(1)},${(CY + Math.sin((i / 6) * Math.PI * 2) * r).toFixed(1)}`).join(' ');
  const pods = [pseudopod(CX, CY, 1.0, 57, 28, 0.35), pseudopod(CX, CY, 4.0, 56, 24, -0.3)];
  const defs = `
    <radialGradient id="av-bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#3d5afe" stop-opacity="0.4"/><stop offset="100%" stop-color="#1a237e" stop-opacity="0"/></radialGradient>
    <radialGradient id="av-body" cx="36%" cy="30%" r="70%"><stop offset="0%" stop-color="#e8eaf6"/><stop offset="16%" stop-color="#7986cb"/><stop offset="42%" stop-color="#3949ab"/><stop offset="68%" stop-color="#1a237e"/><stop offset="88%" stop-color="#0d1460"/><stop offset="100%" stop-color="#050830"/></radialGradient>
    <radialGradient id="av-core" cx="44%" cy="38%" r="58%"><stop offset="0%" stop-color="#ffcdd2" stop-opacity="0.7"/><stop offset="30%" stop-color="#e53935" stop-opacity="0.5"/><stop offset="65%" stop-color="#c62828" stop-opacity="0.2"/><stop offset="100%" stop-color="#7f0000" stop-opacity="0"/></radialGradient>
    <radialGradient id="av-lump" cx="32%" cy="28%" r="72%"><stop offset="0%" stop-color="#c5cae9"/><stop offset="50%" stop-color="#3f51b5"/><stop offset="100%" stop-color="#1a237e"/></radialGradient>
    <radialGradient id="av-nuc" cx="40%" cy="35%" r="65%"><stop offset="0%" stop-color="#ffebee"/><stop offset="40%" stop-color="#e53935"/><stop offset="100%" stop-color="#3e0000"/></radialGradient>
    ${glowFilter('av-glow', 9)}`;
  const body = `
    <circle cx="${CX}" cy="${CY}" r="88" fill="url(#av-bg)"/>
    <g stroke="#5c6bc0" stroke-linecap="round" fill="none" opacity="0.4">${pods.map((d) => `<path d="${d}" stroke-width="0.9"/>`).join('')}</g>
    <g stroke="#5c6bc0" stroke-width="0.7" fill="none" opacity="0.2">
      ${Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return `<line x1="${(CX + Math.cos(a) * 20).toFixed(1)}" y1="${(CY + Math.sin(a) * 20).toFixed(1)}" x2="${(CX + Math.cos(a) * 52).toFixed(1)}" y2="${(CY + Math.sin(a) * 52).toFixed(1)}"/>`; }).join('')}
      <polygon points="${hex(20)}"/><polygon points="${hex(36)}"/>
    </g>
    ${lumps.filter((l) => Math.cos(l.a - 0.3) < 0).map((l) => lumpSvg(l, false)).join('')}
    <path d="${smoothBlob(CX, CY, bodyRadii)}" fill="url(#av-body)" filter="url(#av-glow)"/>
    <path d="${smoothBlob(CX, CY, innerRadii)}" fill="url(#av-core)"/>
    <path d="${smoothBlob(CX, CY + 2, [14,16,13,15,14,17,13,15,14,16,13,15,14,16,13,15])}" fill="url(#av-nuc)" opacity="0.82"/>
    <ellipse cx="${CX - 4}" cy="${CY - 2}" rx="5" ry="4" fill="white" opacity="0.25"/>
    ${lumps.filter((l) => Math.cos(l.a - 0.3) >= 0).map((l) => lumpSvg(l, true)).join('')}
    <ellipse cx="${CX - 18}" cy="${CY - 23}" rx="14" ry="6.5" fill="white" opacity="0.14" transform="rotate(-38,${CX - 18},${CY - 23})"/>`;
  return cellSvg(size, defs, body);
}

/** Heat-Shock Carrier — crimson core wrapped in silver heat-shield plates; thermal immune. */
function heatShockCarrierSvg(size: number): string {
  const bodyRadii = [48,52,46,50,49,53,45,50,48,52,46,50,48,53,46,51,48,52,46,50,47,51,48,52];
  const fibers = makeFibers(CX, CY, 46, 36, 4, 14, 0.4, 1.2, 0.5, 0.2);
  const plates = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2 + 0.2;
    const r = 50;
    const halfW = 0.24;
    const p1 = `${(CX + Math.cos(a - halfW) * (r - 6)).toFixed(1)},${(CY + Math.sin(a - halfW) * (r - 6)).toFixed(1)}`;
    const p2 = `${(CX + Math.cos(a + halfW) * (r - 6)).toFixed(1)},${(CY + Math.sin(a + halfW) * (r - 6)).toFixed(1)}`;
    const p3 = `${(CX + Math.cos(a + halfW * 0.8) * (r + 10)).toFixed(1)},${(CY + Math.sin(a + halfW * 0.8) * (r + 10)).toFixed(1)}`;
    const p4 = `${(CX + Math.cos(a - halfW * 0.8) * (r + 10)).toFixed(1)},${(CY + Math.sin(a - halfW * 0.8) * (r + 10)).toFixed(1)}`;
    return `<polygon points="${p1} ${p2} ${p3} ${p4}" fill="url(#hs-plate)" stroke="#eceff1" stroke-width="0.8" opacity="0.92"/>`;
  }).join('');
  const defs = `
    <radialGradient id="hs-bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ef5350" stop-opacity="0.4"/><stop offset="100%" stop-color="#b71c1c" stop-opacity="0"/></radialGradient>
    <radialGradient id="hs-body" cx="38%" cy="32%" r="68%"><stop offset="0%" stop-color="#ffebee"/><stop offset="18%" stop-color="#ef9a9a"/><stop offset="45%" stop-color="#e53935"/><stop offset="72%" stop-color="#8e0000"/><stop offset="100%" stop-color="#2a0000"/></radialGradient>
    <linearGradient id="hs-plate" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffffff"/><stop offset="45%" stop-color="#b0bec5"/><stop offset="100%" stop-color="#546e7a"/></linearGradient>
    <radialGradient id="hs-nuc" cx="40%" cy="36%" r="64%"><stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#ff5252"/><stop offset="100%" stop-color="#4a0a0a"/></radialGradient>
    ${glowFilter('hs-glow', 8)}`;
  const body = `
    <circle cx="${CX}" cy="${CY}" r="90" fill="url(#hs-bg)"/>
    <circle cx="${CX}" cy="${CY}" r="74" fill="none" stroke="#eceff1" stroke-width="1" stroke-dasharray="3 5" opacity="0.35"/>
    <circle cx="${CX}" cy="${CY}" r="66" fill="none" stroke="#ef9a9a" stroke-width="0.8" stroke-dasharray="2 6" opacity="0.3"/>
    ${fiberGroup(fibers, (i) => (i % 3 === 0 ? '#eceff1' : '#ef9a9a'), 0.7, 0.5)}
    <path d="${smoothBlob(CX, CY, bodyRadii)}" fill="url(#hs-body)" filter="url(#hs-glow)"/>
    ${plates}
    <path d="${smoothBlob(CX, CY + 2, [16,18,15,17,16,19,15,17,16,18,15,17,16,18])}" fill="url(#hs-nuc)" opacity="0.9"/>
    <path d="M${CX - 10},${CY - 4} L${CX - 3},${CY - 4} L${CX},${CY - 12} L${CX + 4},${CY + 6} L${CX + 7},${CY - 4} L${CX + 12},${CY - 4}" fill="none" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.85"/>
    <ellipse cx="${CX - 16}" cy="${CY - 22}" rx="12" ry="5.5" fill="white" opacity="0.18" transform="rotate(-35,${CX - 16},${CY - 22})"/>`;
  return cellSvg(size, defs, body);
}

/** Cytokine Storm boss — massive tangled filament network, white-hot nucleus, fire gradient. */
function cytokineStormSvg(size: number): string {
  const bodyRadii = [44,50,40,48,46,52,42,49,44,51,41,48,45,52,41,49,44,51,42,48,45,52,40,49,44,51,42,48];
  const innerRadii = [28,32,26,30,28,33,25,30,27,31,25,29,27,32,25,30,28,31,26,30,28,32];
  const shortBack = makeFibers(CX, CY, 44, 50, 5, 20, 0.35, 1.3, 0.65, 0.05);
  const longBack = makeFibers(CX, CY, 44, 36, 16, 50, 0.25, 0.9, 0.72, 0.25);
  const frontShort = makeFibers(CX, CY, 44, 38, 4, 16, 0.4, 1.4, 0.55, 0.55);
  const frontLong = makeFibers(CX, CY, 44, 28, 20, 58, 0.2, 0.8, 0.78, 0.7);
  const fireColors = ['#ffffff', '#ffff8d', '#ffea00', '#ff9100', '#ff6d00', '#dd2c00', '#bf360c'];
  const fc = (p: number) => fireColors[Math.min(Math.floor(p * (fireColors.length - 1)), fireColors.length - 2)]!;
  const podSpecs: [number, number, number][] = [[0.3, 50, 0.55], [1.1, 62, -0.4], [2.0, 45, 0.48], [3.3, 55, -0.5], [4.4, 48, 0.42], [5.5, 58, -0.38]];
  const pods = podSpecs.map(([a, len, curl]) => pseudopod(CX, CY, a, 49, len, curl));
  const defs = `
    <radialGradient id="cs-bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ff9100" stop-opacity="0.6"/><stop offset="60%" stop-color="#ff6d00" stop-opacity="0.2"/><stop offset="100%" stop-color="#dd2c00" stop-opacity="0"/></radialGradient>
    <radialGradient id="cs-body" cx="40%" cy="34%" r="66%"><stop offset="0%" stop-color="#ffffff"/><stop offset="8%" stop-color="#ffff8d"/><stop offset="22%" stop-color="#ffea00"/><stop offset="42%" stop-color="#ff9100"/><stop offset="62%" stop-color="#e64a19"/><stop offset="80%" stop-color="#bf360c"/><stop offset="94%" stop-color="#6a1000"/><stop offset="100%" stop-color="#280500"/></radialGradient>
    <radialGradient id="cs-inner" cx="46%" cy="40%" r="56%"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/><stop offset="25%" stop-color="#ffff8d" stop-opacity="0.6"/><stop offset="60%" stop-color="#ff9100" stop-opacity="0.3"/><stop offset="100%" stop-color="#ff6d00" stop-opacity="0"/></radialGradient>
    <radialGradient id="cs-nuc" cx="42%" cy="38%" r="62%"><stop offset="0%" stop-color="#ffffff"/><stop offset="20%" stop-color="#ffff8d"/><stop offset="60%" stop-color="#ffea00"/><stop offset="100%" stop-color="#ff6d00"/></radialGradient>
    ${glowFilter('cs-glow', 9)}`;
  const body = `
    <circle cx="${CX}" cy="${CY}" r="96" fill="url(#cs-bg)"/>
    <g stroke-linecap="round" fill="none" opacity="0.55">${pods.map((d, i) => `<path d="${d}" stroke="${i < 2 ? '#ffea00' : i < 4 ? '#ff9100' : '#ff6d00'}" stroke-width="${(1.2 - i * 0.06).toFixed(2)}"/>`).join('')}</g>
    ${fiberGroup(longBack, (i) => fc(Math.abs(Math.sin(i * 1.3)) * 0.7), 0.6, 0.4)}
    ${fiberGroup(shortBack, (i) => (i % 4 === 0 ? '#ffab40' : i % 3 === 0 ? '#ff7043' : '#ff6d00'), 0.65, 0.48)}
    <path d="${smoothBlob(CX, CY, bodyRadii)}" fill="url(#cs-body)" filter="url(#cs-glow)"/>
    <path d="${smoothBlob(CX, CY, innerRadii)}" fill="url(#cs-inner)"/>
    <path d="${smoothBlob(CX, CY, [15,17,14,16,15,18,14,16,15,17,14,16,15,17,14,16,15,17])}" fill="url(#cs-nuc)" filter="url(#cs-glow)" opacity="0.95"/>
    <circle cx="${CX}" cy="${CY}" r="8" fill="white" opacity="0.7"/><circle cx="${CX}" cy="${CY}" r="4" fill="white" opacity="0.9"/>
    ${fiberGroup(frontShort, (i) => (i % 4 === 0 ? '#ffff8d' : i % 3 === 0 ? '#ffea00' : i % 5 === 0 ? '#ffcc02' : '#ff9100'))}
    ${fiberGroup(frontLong, (i) => fc(Math.abs(Math.sin(i * 2.1)) * 0.5), 1, 0.75)}
    ${frontLong.filter((_, i) => i % 5 === 0).map((f) => `<circle cx="${f.ex.toFixed(1)}" cy="${f.ey.toFixed(1)}" r="1.5" fill="#ffff8d" opacity="0.5"/>`).join('')}
    <ellipse cx="${CX - 16}" cy="${CY - 21}" rx="12" ry="5.5" fill="white" opacity="0.2" transform="rotate(-38,${CX - 16},${CY - 21})"/>`;
  return cellSvg(size, defs, body);
}

export function getEnemySvg(enemyTypeId: string, size = 48): string {
  switch (enemyTypeId) {
    case 'RHINOVIRUS':
      return acutePathogenSvg(size);
    case 'INFLUENZA':
      return viralAgentSvg(size);
    case 'CORONA_TITAN':
      return armoredVirusSvg(size);
    case 'HEATSHOCK_CARRIER':
      return heatShockCarrierSvg(size);
    case 'RETRO_MUTANT':
      return cytokineStormSvg(size);
    default: {
      const p = ENEMY_PALETTES[enemyTypeId] ?? ENEMY_PALETTES.INFLUENZA!;
      return spriteSvg(size, `<circle cx="60" cy="60" r="40" fill="${p.base}" stroke="${p.light}" stroke-width="2"/>`);
    }
  }
}

export function getHealthBarSvg(size = 96, ratio = 1): string {
  const clamped = Math.max(0, Math.min(1, ratio));
  return `<svg viewBox="0 0 160 24" width="${size}" height="${Math.round(size * 0.15)}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="health-fill"><stop stop-color="#10b981"/><stop offset=".7" stop-color="#00e5ff"/><stop offset="1" stop-color="#ff3366"/></linearGradient></defs><rect x="1" y="3" width="158" height="18" rx="9" fill="#050814" stroke="#334155" stroke-width="2"/><rect x="4" y="6" width="${152 * clamped}" height="12" rx="6" fill="url(#health-fill)"/><circle cx="${4 + 152 * clamped}" cy="12" r="3" fill="#fff" opacity=".8"/></svg>`;
}

export function getScoreIconSvg(size = 24): string {
  return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none"><defs><radialGradient id="score-core"><stop stop-color="#f3e8ff"/><stop offset=".45" stop-color="#a855f7"/><stop offset="1" stop-color="#4c1d95"/></radialGradient></defs><circle cx="60" cy="60" r="52" fill="#2e1065" stroke="#c084fc" stroke-width="3"/><path d="M60 18 70 45 99 46 76 63 84 91 60 75 36 91 44 63 21 46 50 45Z" fill="url(#score-core)" stroke="#f5d0fe" stroke-width="2"/><circle cx="60" cy="58" r="7" fill="#fff" opacity=".85"/></svg>`;
}

export function getTowerSvg(towerTypeId: string, size = 64): string {
  switch (towerTypeId) {
    case 'IGG':
      return `
        <svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none">
          <defs>
            <radialGradient id="igg-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.5"/>
              <stop offset="60%" stop-color="#006064" stop-opacity="0.2"/>
              <stop offset="100%" stop-color="#003040" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="igg-body" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stop-color="#b2ebf2"/>
              <stop offset="18%" stop-color="#00bcd4"/>
              <stop offset="45%" stop-color="#00838f"/>
              <stop offset="72%" stop-color="#004d5c"/>
              <stop offset="100%" stop-color="#001a24"/>
            </radialGradient>
            <radialGradient id="igg-nuc" cx="40%" cy="38%" r="65%">
              <stop offset="0%" stop-color="#e0ffff"/>
              <stop offset="50%" stop-color="#0097a7"/>
              <stop offset="100%" stop-color="#00363a"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="92" fill="url(#igg-bg)"/>
          <!-- Pseudopod tentacles -->
          <g stroke="#00bcd4" stroke-linecap="round" fill="none" opacity="0.6">
            <path d="M100,100 C130,120 150,135 170,140" stroke-width="2"/>
            <path d="M100,100 C70,140 50,150 30,165" stroke-width="1.8"/>
            <path d="M100,100 C80,60 60,45 35,35" stroke-width="1.8"/>
          </g>
          <!-- Outer fibril mesh -->
          <g stroke="#00e5ff" stroke-width="1.2" opacity="0.55" fill="none">
            ${Array.from({ length: 28 }, (_, i) => {
              const a = (i / 28) * Math.PI * 2;
              const r1 = 52 + Math.sin(i * 2.3) * 4;
              const r2 = r1 + 12 + Math.sin(i * 3.7) * 8;
              const x1 = 100 + Math.cos(a) * r1;
              const y1 = 100 + Math.sin(a) * r1;
              const x2 = 100 + Math.cos(a + 0.15) * r2;
              const y2 = 100 + Math.sin(a + 0.15) * r2;
              return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`;
            }).join('')}
          </g>
          <!-- Cell Body -->
          <circle cx="100" cy="100" r="54" fill="url(#igg-body)" stroke="#80deea" stroke-width="1.5"/>
          <!-- Inner Nucleus -->
          <circle cx="102" cy="104" r="22" fill="url(#igg-nuc)"/>
          <!-- IgG Y-Antibody Core Emitter -->
          <g stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.95">
            <line x1="100" y1="114" x2="100" y2="98" stroke-width="4.5" stroke="#00bcd4"/>
            <line x1="100" y1="98" x2="84" y2="84" stroke-width="4" stroke="#00e5ff"/>
            <line x1="100" y1="98" x2="116" y2="84" stroke-width="4" stroke="#00e5ff"/>
            <circle cx="84" cy="84" r="3" fill="#ffffff"/>
            <circle cx="116" cy="84" r="3" fill="#ffffff"/>
            <circle cx="100" cy="98" r="4.5" fill="#ffffff"/>
          </g>
        </svg>
      `;

    case 'IGM':
      return `
        <svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none">
          <defs>
            <radialGradient id="igm-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#e040fb" stop-opacity="0.45"/>
              <stop offset="100%" stop-color="#6a0080" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="igm-unit" cx="36%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#fce4ec"/>
              <stop offset="20%" stop-color="#f06292"/>
              <stop offset="50%" stop-color="#ad1457"/>
              <stop offset="78%" stop-color="#6a0032"/>
              <stop offset="100%" stop-color="#2a0015"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="90" fill="url(#igm-bg)"/>
          <!-- Connecting pentamer tissue -->
          <g stroke="#880e4f" stroke-width="4" stroke-linecap="round" opacity="0.6">
            ${Array.from({ length: 5 }, (_, i) => {
              const a1 = (i / 5) * Math.PI * 2 - Math.PI / 2;
              const a2 = ((i + 1) / 5) * Math.PI * 2 - Math.PI / 2;
              const x1 = 100 + Math.cos(a1) * 36;
              const y1 = 100 + Math.sin(a1) * 36;
              const x2 = 100 + Math.cos(a2) * 36;
              const y2 = 100 + Math.sin(a2) * 36;
              return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" /><line x1="100" y1="100" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" />`;
            }).join('')}
          </g>
          <!-- 5 Pentameric Lobes -->
          ${Array.from({ length: 5 }, (_, i) => {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const lx = 100 + Math.cos(a) * 36;
            const ly = 100 + Math.sin(a) * 36;
            return `
              <circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="20" fill="url(#igm-unit)" stroke="#f48fb1" stroke-width="1.2"/>
              <circle cx="${(lx - 4).toFixed(1)}" cy="${(ly - 4).toFixed(1)}" r="5" fill="#ffffff" opacity="0.4"/>
            `;
          }).join('')}
          <!-- Central J-chain joining node -->
          <circle cx="100" cy="100" r="14" fill="#f8bbd0" stroke="#c2185b" stroke-width="2"/>
          <circle cx="100" cy="100" r="6" fill="#ffffff"/>
        </svg>
      `;

    case 'IGA':
      return `
        <svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none">
          <defs>
            <radialGradient id="iga-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#76ff03" stop-opacity="0.45"/>
              <stop offset="100%" stop-color="#1b5e20" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="iga-body" cx="36%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#f1ffe0"/>
              <stop offset="15%" stop-color="#b9f6ca"/>
              <stop offset="38%" stop-color="#2e7d32"/>
              <stop offset="65%" stop-color="#1b5e20"/>
              <stop offset="100%" stop-color="#051505"/>
            </radialGradient>
            <radialGradient id="iga-cryo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#e8ffe0"/>
              <stop offset="100%" stop-color="#00e676"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="90" fill="url(#iga-bg)"/>
          <!-- Tangled crystalline spikes -->
          ${Array.from({ length: 14 }, (_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const r1 = 50;
            const r2 = 68 + Math.sin(i * 2.8) * 8;
            const x1 = 100 + Math.cos(a - 0.12) * r1;
            const y1 = 100 + Math.sin(a - 0.12) * r1;
            const x2 = 100 + Math.cos(a + 0.12) * r1;
            const y2 = 100 + Math.sin(a + 0.12) * r1;
            const tx = 100 + Math.cos(a) * r2;
            const ty = 100 + Math.sin(a) * r2;
            return `<polygon points="${x1.toFixed(1)},${y1.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="url(#iga-cryo)" stroke="#2e7d32" stroke-width="0.8" opacity="0.8"/>`;
          }).join('')}
          <!-- Main dimeric cellular body -->
          <circle cx="100" cy="100" r="50" fill="url(#iga-body)" stroke="#b9f6ca" stroke-width="1.5"/>
          <!-- Dimeric secretory link -->
          <ellipse cx="80" cy="100" rx="14" ry="10" fill="#33691e" stroke="#ccff90" stroke-width="1"/>
          <ellipse cx="120" cy="100" rx="14" ry="10" fill="#33691e" stroke="#ccff90" stroke-width="1"/>
          <rect x="94" y="94" width="12" height="12" rx="3" fill="#76ff03" stroke="#ffffff" stroke-width="1"/>
          <circle cx="100" cy="100" r="4" fill="#ffffff"/>
        </svg>
      `;

    case 'KILLER_T':
      return `
        <svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none">
          <defs>
            <radialGradient id="kt-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffea00" stop-opacity="0.45"/>
              <stop offset="100%" stop-color="#bf360c" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="kt-body" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stop-color="#fff8e1"/>
              <stop offset="14%" stop-color="#ffd54f"/>
              <stop offset="38%" stop-color="#f57f17"/>
              <stop offset="62%" stop-color="#bf360c"/>
              <stop offset="100%" stop-color="#350500"/>
            </radialGradient>
            <radialGradient id="kt-inner" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stop-color="#b3e5fc" stop-opacity="0.8"/>
              <stop offset="60%" stop-color="#0288d1" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#01579b" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="92" fill="url(#kt-bg)"/>
          <!-- Cylindrical microvilli dense crown -->
          <g fill="#f57f17" stroke="#ffd54f" stroke-width="0.8">
            ${Array.from({ length: 36 }, (_, i) => {
              const a = (i / 36) * Math.PI * 2;
              const r1 = 54;
              const r2 = r1 + 14 + Math.sin(i * 3.1) * 6;
              const w = 4;
              const x1 = 100 + Math.cos(a) * r1;
              const y1 = 100 + Math.sin(a) * r1;
              const x2 = 100 + Math.cos(a) * r2;
              const y2 = 100 + Math.sin(a) * r2;
              return `
                <line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#ffd54f" stroke-width="${w}" stroke-linecap="round"/>
                <circle cx="${x2.toFixed(1)}" cy="${y2.toFixed(1)}" r="2.5" fill="#fff8e1" stroke="none"/>
              `;
            }).join('')}
          </g>
          <!-- Cell Body -->
          <circle cx="100" cy="100" r="56" fill="url(#kt-body)" stroke="#ffd54f" stroke-width="2"/>
          <!-- Visible blue cytoplasm core inside T-Cell -->
          <circle cx="100" cy="100" r="28" fill="url(#kt-inner)"/>
          <!-- Thermal Prism Cytotoxic Core -->
          <polygon points="100,82 118,112 82,112" fill="#fff9c4" stroke="#bf360c" stroke-width="2"/>
          <circle cx="100" cy="102" r="6" fill="#00e5ff" stroke="#ffffff" stroke-width="1.5"/>
        </svg>
      `;

    case 'MACROPHAGE': {
      const bodyRadii = [50,58,46,60,52,62,45,56,50,61,47,57,49,63,46,58,51,60,47,56];
      const fibers = makeFibers(100, 100, 50, 40, 4, 16, 0.4, 1.3, 0.6, 0.15);
      const podSpecs: [number, number, number][] = [[0.5, 42, 0.5], [1.7, 36, -0.35], [2.9, 46, 0.4], [4.1, 34, -0.45], [5.4, 40, 0.3]];
      const pods = podSpecs.map(([a, len, curl]) => pseudopod(100, 100, a, 56, len, curl));
      const lysosomes = Array.from({ length: 7 }, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + 0.4;
        const r = 24 + Math.sin(i * 2.3) * 6;
        return `<circle cx="${(100 + Math.cos(a) * r).toFixed(1)}" cy="${(100 + Math.sin(a) * r).toFixed(1)}" r="${(4 + Math.abs(Math.sin(i * 1.7)) * 2.5).toFixed(1)}" fill="#ede9fe" stroke="#7c3aed" stroke-width="0.8" opacity="0.85"/>`;
      }).join('');
      return cellSvg(size, `
        <radialGradient id="mac-bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#a78bfa" stop-opacity="0.45"/><stop offset="100%" stop-color="#4c1d95" stop-opacity="0"/></radialGradient>
        <radialGradient id="mac-body" cx="36%" cy="30%" r="70%"><stop offset="0%" stop-color="#f5f3ff"/><stop offset="16%" stop-color="#c4b5fd"/><stop offset="42%" stop-color="#7c3aed"/><stop offset="70%" stop-color="#4c1d95"/><stop offset="100%" stop-color="#1e0a3c"/></radialGradient>
        <radialGradient id="mac-nuc" cx="40%" cy="36%" r="64%"><stop offset="0%" stop-color="#f5f3ff"/><stop offset="45%" stop-color="#a78bfa"/><stop offset="100%" stop-color="#2e1065"/></radialGradient>
        ${glowFilter('mac-glow', 9)}`, `
        <circle cx="100" cy="100" r="92" fill="url(#mac-bg)"/>
        <g stroke="#a78bfa" stroke-linecap="round" fill="none" opacity="0.7">${pods.map((d, i) => `<path d="${d}" stroke-width="${(3.2 - i * 0.3).toFixed(1)}"/>`).join('')}</g>
        ${fiberGroup(fibers, (i) => (i % 3 === 0 ? '#ede9fe' : '#c4b5fd'), 0.8, 0.6)}
        <path d="${smoothBlob(100, 100, bodyRadii)}" fill="url(#mac-body)" filter="url(#mac-glow)" stroke="#c4b5fd" stroke-width="1.2"/>
        ${lysosomes}
        <path d="${smoothBlob(96, 104, [17,19,16,18,17,20,16,18,17,19,16,18])}" fill="url(#mac-nuc)" opacity="0.9"/>
        <ellipse cx="90" cy="96" rx="5" ry="3.5" fill="white" opacity="0.35"/>
        <ellipse cx="78" cy="74" rx="13" ry="6" fill="white" opacity="0.14" transform="rotate(-35,78,74)"/>`);
    }

    default:
      return '';
  }
}

/** Compact themed icon for the shared specialization specials. */
function genericBranchIcon(size: number, primary: string, dark: string, glyph: string): string {
  const gid = `gb-${primary.slice(1)}`;
  return `
    <svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none">
      <defs>
        <radialGradient id="${gid}" cx="38%" cy="32%" r="68%"><stop offset="0%" stop-color="#ffffff"/><stop offset="22%" stop-color="${primary}"/><stop offset="100%" stop-color="${dark}"/></radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="${primary}" opacity="0.18"/>
      <circle cx="100" cy="100" r="54" fill="url(#${gid})" stroke="${primary}" stroke-width="2"/>
      ${glyph}
      <circle cx="162" cy="38" r="12" fill="${dark}" stroke="${primary}" stroke-width="1.5"/>
      <text x="162" y="42" text-anchor="middle" fill="${primary}" font-size="10" font-family="'Share Tech Mono',monospace" font-weight="bold">II</text>
    </svg>`;
}

export function getBranchUpgradeSvg(specialization: string, size = 48): string {
  switch (specialization) {
    case 'CRIT_CHANCE_25':
    case 'Hyperpulse Barrage':
    case 'Hyper-Gatling':
      return `
        <svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none">
          <defs>
            <radialGradient id="hpb-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#006064" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="hpb-body" cx="36%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#e0ffff"/>
              <stop offset="18%" stop-color="#00e5ff"/>
              <stop offset="45%" stop-color="#0097a7"/>
              <stop offset="72%" stop-color="#004d5c"/>
              <stop offset="100%" stop-color="#001a24"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="92" fill="url(#hpb-bg)"/>
          <!-- Speed trail streaks -->
          <g stroke="#00e5ff" stroke-linecap="round" opacity="0.6">
            ${Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              const r1 = 58;
              const r2 = 82 + Math.abs(Math.sin(i * 1.7)) * 16;
              const sx = 100 + Math.cos(a) * r1;
              const sy = 100 + Math.sin(a) * r1;
              const ex = 100 + Math.cos(a) * r2;
              const ey = 100 + Math.sin(a) * r2;
              return `<line x1="${sx.toFixed(1)}" y1="${sy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke-width="2" />`;
            }).join('')}
          </g>
          <!-- Cell Body -->
          <circle cx="100" cy="100" r="52" fill="url(#hpb-body)" stroke="#80deea" stroke-width="2"/>
          <!-- Triple Y-arms (120 deg apart) -->
          ${[0, (2 * Math.PI) / 3, (4 * Math.PI) / 3]
            .map((baseAngle) => {
              const stemLen = 38;
              const armLen = 22;
              const ex = 100 + Math.cos(baseAngle) * stemLen;
              const ey = 100 + Math.sin(baseAngle) * stemLen;
              const la = baseAngle - 0.55;
              const ra = baseAngle + 0.55;
              const lax = ex + Math.cos(la) * armLen;
              const lay = ey + Math.sin(la) * armLen;
              const rax = ex + Math.cos(ra) * armLen;
              const ray = ey + Math.sin(ra) * armLen;
              return `
                <line x1="100" y1="100" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="#b2ebf2" stroke-width="3" stroke-linecap="round"/>
                <line x1="${ex.toFixed(1)}" y1="${ey.toFixed(1)}" x2="${lax.toFixed(1)}" y2="${lay.toFixed(1)}" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="${ex.toFixed(1)}" y1="${ey.toFixed(1)}" x2="${rax.toFixed(1)}" y2="${ray.toFixed(1)}" stroke="#00e5ff" stroke-width="2.5" stroke-linecap="round"/>
                <circle cx="${lax.toFixed(1)}" cy="${lay.toFixed(1)}" r="3.5" fill="#ffffff"/>
                <circle cx="${rax.toFixed(1)}" cy="${ray.toFixed(1)}" r="3.5" fill="#ffffff"/>
              `;
            })
            .join('')}
          <!-- Tier II badge -->
          <circle cx="162" cy="38" r="12" fill="#001a24" stroke="#00e5ff" stroke-width="1.5"/>
          <text x="162" y="42" text-anchor="middle" fill="#00e5ff" font-size="10" font-family="'Share Tech Mono',monospace" font-weight="bold">II</text>
        </svg>
      `;

    case 'CHAIN_LIGHTNING_3':
    case 'Antibody Storm':
    case 'Chain Pulse':
      return `
        <svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none">
          <defs>
            <radialGradient id="abs-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#00e5ff" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#006064" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="abs-body" cx="36%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#e0ffff"/>
              <stop offset="20%" stop-color="#00bcd4"/>
              <stop offset="50%" stop-color="#00838f"/>
              <stop offset="100%" stop-color="#001a24"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="94" fill="url(#abs-bg)"/>
          <circle cx="100" cy="100" r="72" fill="none" stroke="#00bcd4" stroke-width="1" stroke-dasharray="4 6" opacity="0.4"/>
          <!-- Swirl vortex connections -->
          <g stroke="#00e5ff" stroke-width="1.2" fill="none" opacity="0.4">
            ${Array.from({ length: 6 }, (_, i) => {
              const a = (i / 6) * Math.PI * 2 - Math.PI / 3;
              const sx = 100 + Math.cos(a) * 72;
              const sy = 100 + Math.sin(a) * 72;
              return `<path d="M${sx.toFixed(1)},${sy.toFixed(1)} Q${(sx * 0.7 + 30).toFixed(1)},${(sy * 0.7 + 30).toFixed(1)} 100,100" />`;
            }).join('')}
          </g>
          <!-- Center cell body -->
          <circle cx="100" cy="100" r="48" fill="url(#abs-body)" stroke="#80deea" stroke-width="1.5"/>
          <!-- 6 Orbiting mini Y-arms -->
          ${Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 - Math.PI / 3;
            const ox = 100 + Math.cos(a) * 72;
            const oy = 100 + Math.sin(a) * 72;
            const ex = ox + Math.cos(a) * 9;
            const ey = oy + Math.sin(a) * 9;
            return `
              <circle cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" r="8" fill="#003c47" stroke="#00e5ff" stroke-width="1"/>
              <line x1="${ox.toFixed(1)}" y1="${oy.toFixed(1)}" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke="#b2ebf2" stroke-width="1.8"/>
              <circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="2.5" fill="#ffffff"/>
            `;
          }).join('')}
          <!-- Tier II badge -->
          <circle cx="162" cy="38" r="12" fill="#001a24" stroke="#00e5ff" stroke-width="1.5"/>
          <text x="162" y="42" text-anchor="middle" fill="#00e5ff" font-size="10" font-family="'Share Tech Mono',monospace" font-weight="bold">II</text>
        </svg>
      `;

    case 'ACID_POOL_DOT':
    case 'Toxin Nebula':
    case 'Plasma Rupture':
      return `
        <svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none">
          <defs>
            <radialGradient id="tn-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ce93d8" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#1a0030" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="tn-unit" cx="36%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#fce4ec"/>
              <stop offset="22%" stop-color="#f06292"/>
              <stop offset="52%" stop-color="#ad1457"/>
              <stop offset="100%" stop-color="#2a0015"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="94" fill="url(#tn-bg)"/>
          <!-- Corrosive toxic cloud blobs -->
          <g opacity="0.6">
            ${Array.from({ length: 10 }, (_, i) => {
              const a = (i / 10) * Math.PI * 2;
              const r = 62 + Math.sin(i * 2.3) * 14;
              const bx = 100 + Math.cos(a) * r;
              const by = 100 + Math.sin(a) * r;
              return `<circle cx="${bx.toFixed(1)}" cy="${by.toFixed(1)}" r="14" fill="#76ff03" opacity="0.25" />`;
            }).join('')}
          </g>
          <!-- Pentameric units -->
          ${Array.from({ length: 5 }, (_, i) => {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const ux = 100 + Math.cos(a) * 34;
            const uy = 100 + Math.sin(a) * 34;
            return `
              <circle cx="${ux.toFixed(1)}" cy="${uy.toFixed(1)}" r="18" fill="url(#tn-unit)" stroke="#f48fb1" stroke-width="1.2"/>
              <circle cx="${ux.toFixed(1)}" cy="${uy.toFixed(1)}" r="6" fill="#76ff03" opacity="0.4"/>
            `;
          }).join('')}
          <circle cx="100" cy="100" r="14" fill="#f8bbd0" stroke="#c2185b" stroke-width="2"/>
          <circle cx="100" cy="100" r="5" fill="#76ff03"/>
          <!-- Tier II badge -->
          <circle cx="162" cy="38" r="12" fill="#1a0030" stroke="#e040fb" stroke-width="1.5"/>
          <text x="162" y="42" text-anchor="middle" fill="#e040fb" font-size="10" font-family="'Share Tech Mono',monospace" font-weight="bold">II</text>
        </svg>
      `;

    case 'CLUSTER_FRAGMENTS_4':
    case 'Chain Reaction':
    case 'Cluster Shells':
      return `
        <svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none">
          <defs>
            <radialGradient id="cr-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#e040fb" stop-opacity="0.45"/>
              <stop offset="100%" stop-color="#3a0052" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="cr-unit" cx="36%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#fce4ec"/>
              <stop offset="22%" stop-color="#f06292"/>
              <stop offset="52%" stop-color="#ad1457"/>
              <stop offset="100%" stop-color="#2a0015"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="94" fill="url(#cr-bg)"/>
          <!-- Arc lightning links -->
          ${Array.from({ length: 5 }, (_, i) => {
            const a1 = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const a2 = ((i + 1) / 5) * Math.PI * 2 - Math.PI / 2;
            const x1 = 100 + Math.cos(a1) * 34;
            const y1 = 100 + Math.sin(a1) * 34;
            const x2 = 100 + Math.cos(a2) * 34;
            const y2 = 100 + Math.sin(a2) * 34;
            const mx = (x1 + x2) / 2 + (y1 - y2) * 0.2;
            const my = (y1 + y2) / 2 + (x2 - x1) * 0.2;
            return `
              <path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
              <path d="M100,100 L${x1.toFixed(1)},${y1.toFixed(1)}" stroke="#e040fb" stroke-width="1.5" stroke-dasharray="3 3"/>
            `;
          }).join('')}
          <!-- 5 Units -->
          ${Array.from({ length: 5 }, (_, i) => {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const ux = 100 + Math.cos(a) * 34;
            const uy = 100 + Math.sin(a) * 34;
            return `
              <circle cx="${ux.toFixed(1)}" cy="${uy.toFixed(1)}" r="17" fill="url(#cr-unit)" stroke="#f48fb1" stroke-width="1.2"/>
              <circle cx="${ux.toFixed(1)}" cy="${uy.toFixed(1)}" r="4.5" fill="#ffffff"/>
            `;
          }).join('')}
          <circle cx="100" cy="100" r="14" fill="#f8bbd0" stroke="#c2185b" stroke-width="2"/>
          <circle cx="100" cy="100" r="6" fill="#ffffff"/>
          <!-- Tier II badge -->
          <circle cx="162" cy="38" r="12" fill="#1a0030" stroke="#e040fb" stroke-width="1.5"/>
          <text x="162" y="42" text-anchor="middle" fill="#e040fb" font-size="10" font-family="'Share Tech Mono',monospace" font-weight="bold">II</text>
        </svg>
      `;

    case 'SLOW_70_BRITTLE_25':
    case 'Deep Freeze':
      return `
        <svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none">
          <defs>
            <radialGradient id="df-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#b3e5fc" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#006064" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="df-body" cx="38%" cy="32%" r="68%">
              <stop offset="0%" stop-color="#e0ffff"/>
              <stop offset="20%" stop-color="#b3e5fc"/>
              <stop offset="45%" stop-color="#0097a7"/>
              <stop offset="100%" stop-color="#001018"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="95" fill="url(#df-bg)"/>
          <!-- Large Anchor Ice Spikes -->
          ${Array.from({ length: 8 }, (_, i) => {
            const a = (i / 8) * Math.PI * 2 + 0.3;
            const r1 = 48;
            const r2 = 78 + Math.sin(i * 3.3) * 8;
            const lx = 100 + Math.cos(a - 0.12) * r1;
            const ly = 100 + Math.sin(a - 0.12) * r1;
            const rx = 100 + Math.cos(a + 0.12) * r1;
            const ry = 100 + Math.sin(a + 0.12) * r1;
            const tx = 100 + Math.cos(a) * r2;
            const ty = 100 + Math.sin(a) * r2;
            return `<polygon points="${lx.toFixed(1)},${ly.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} ${rx.toFixed(1)},${ry.toFixed(1)}" fill="#b3e5fc" stroke="#e0ffff" stroke-width="0.8"/>`;
          }).join('')}
          <!-- Frosted Core Cell Body -->
          <circle cx="100" cy="100" r="50" fill="url(#df-body)" stroke="#e0ffff" stroke-width="2"/>
          <circle cx="100" cy="100" r="24" fill="#ffffff" opacity="0.35"/>
          <!-- Frost crack lines -->
          <path d="M100,100 L85,80 M100,100 L118,84 M100,100 L115,118 M100,100 L82,112" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round"/>
          <!-- Tier II badge -->
          <circle cx="162" cy="38" r="12" fill="#002b15" stroke="#76ff03" stroke-width="1.5"/>
          <text x="162" y="42" text-anchor="middle" fill="#76ff03" font-size="10" font-family="'Share Tech Mono',monospace" font-weight="bold">II</text>
        </svg>
      `;

    case 'OMNI_AURA_SLOW':
    case 'Glacial Aura':
      return `
        <svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none">
          <defs>
            <radialGradient id="ga-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#80deea" stop-opacity="0.4"/>
              <stop offset="100%" stop-color="#006064" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="ga-body" cx="36%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#e0ffff"/>
              <stop offset="18%" stop-color="#76ff03"/>
              <stop offset="45%" stop-color="#2e7d32"/>
              <stop offset="100%" stop-color="#051505"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="96" fill="url(#ga-bg)"/>
          <!-- 360 frost aura ring -->
          <circle cx="100" cy="100" r="82" fill="none" stroke="#b3e5fc" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.6"/>
          <circle cx="100" cy="100" r="64" fill="none" stroke="#76ff03" stroke-width="1" stroke-dasharray="3 5" opacity="0.5"/>
          <!-- Cell Body -->
          <circle cx="100" cy="100" r="48" fill="url(#ga-body)" stroke="#ccff90" stroke-width="1.5"/>
          <!-- 6-fold Snowflake Geometry -->
          <g stroke="#e0ffff" stroke-linecap="round">
            ${Array.from({ length: 6 }, (_, i) => {
              const a = (i / 6) * Math.PI * 2;
              const ex = 100 + Math.cos(a) * 78;
              const ey = 100 + Math.sin(a) * 78;
              const bx1 = 100 + Math.cos(a) * 56;
              const by1 = 100 + Math.sin(a) * 56;
              const b1a = bx1 + Math.cos(a + Math.PI / 3) * 10;
              const b1b = by1 + Math.sin(a + Math.PI / 3) * 10;
              const b2a = bx1 + Math.cos(a - Math.PI / 3) * 10;
              const b2b = by1 + Math.sin(a - Math.PI / 3) * 10;
              return `
                <line x1="100" y1="100" x2="${ex.toFixed(1)}" y2="${ey.toFixed(1)}" stroke-width="2"/>
                <line x1="${bx1.toFixed(1)}" y1="${by1.toFixed(1)}" x2="${b1a.toFixed(1)}" y2="${b1b.toFixed(1)}" stroke-width="1.2"/>
                <line x1="${bx1.toFixed(1)}" y1="${by1.toFixed(1)}" x2="${b2a.toFixed(1)}" y2="${b2b.toFixed(1)}" stroke-width="1.2"/>
              `;
            }).join('')}
          </g>
          <circle cx="100" cy="100" r="7" fill="#ffffff"/>
          <!-- Tier II badge -->
          <circle cx="162" cy="38" r="12" fill="#002b15" stroke="#76ff03" stroke-width="1.5"/>
          <text x="162" y="42" text-anchor="middle" fill="#76ff03" font-size="10" font-family="'Share Tech Mono',monospace" font-weight="bold">II</text>
        </svg>
      `;

    case 'RAMP_8X_FAST':
    case 'Perforin Lance':
    case 'Focused Ion Lance':
      return `
        <svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none">
          <defs>
            <radialGradient id="pl-bg" cx="40%" cy="50%" r="55%">
              <stop offset="0%" stop-color="#ffea00" stop-opacity="0.45"/>
              <stop offset="100%" stop-color="#bf360c" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="pl-body" cx="36%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#fff8e1"/>
              <stop offset="16%" stop-color="#ffd54f"/>
              <stop offset="40%" stop-color="#f57f17"/>
              <stop offset="100%" stop-color="#300500"/>
            </radialGradient>
          </defs>
          <circle cx="88" cy="100" r="86" fill="url(#pl-bg)"/>
          <!-- Extended Crystalline Perforin Lance Weapon -->
          <polygon points="138,90 188,100 138,110" fill="#ffea00" stroke="#ffffff" stroke-width="1.5"/>
          <polygon points="138,90 188,100 138,100" fill="#fff8e1" opacity="0.8"/>
          <line x1="140" y1="100" x2="184" y2="100" stroke="#ffffff" stroke-width="2"/>
          <circle cx="188" cy="100" r="4.5" fill="#ffffff"/>
          <!-- Cell Body -->
          <circle cx="88" cy="100" r="50" fill="url(#pl-body)" stroke="#ffd54f" stroke-width="2"/>
          <!-- Microvilli -->
          <g stroke="#ffd54f" stroke-width="2" stroke-linecap="round">
            ${Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * Math.PI * 2;
              if (Math.abs(Math.sin(a)) < 0.25 && Math.cos(a) > 0) return '';
              const x1 = 88 + Math.cos(a) * 48;
              const y1 = 100 + Math.sin(a) * 48;
              const x2 = 88 + Math.cos(a) * 60;
              const y2 = 100 + Math.sin(a) * 60;
              return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" />`;
            }).join('')}
          </g>
          <circle cx="88" cy="100" r="24" fill="#0288d1" opacity="0.8"/>
          <circle cx="88" cy="100" r="8" fill="#ffffff"/>
          <!-- Tier II badge -->
          <circle cx="162" cy="38" r="12" fill="#301500" stroke="#ffd54f" stroke-width="1.5"/>
          <text x="162" y="42" text-anchor="middle" fill="#ffd54f" font-size="10" font-family="'Share Tech Mono',monospace" font-weight="bold">II</text>
        </svg>
      `;

    case 'MULTI_BEAM_3':
    case 'Cytotoxic Nova':
    case 'Multi-Prism Beam':
      return `
        <svg viewBox="0 0 200 200" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" class="select-none pointer-events-none">
          <defs>
            <radialGradient id="cn-bg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffea00" stop-opacity="0.5"/>
              <stop offset="100%" stop-color="#bf360c" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="cn-body" cx="36%" cy="30%" r="70%">
              <stop offset="0%" stop-color="#fff8e1"/>
              <stop offset="16%" stop-color="#ffd54f"/>
              <stop offset="40%" stop-color="#ff8f00"/>
              <stop offset="100%" stop-color="#300500"/>
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="96" fill="url(#cn-bg)"/>
          <!-- Nova Ring Burst -->
          <circle cx="100" cy="100" r="76" fill="none" stroke="#ffea00" stroke-width="1.5" stroke-dasharray="6 4" opacity="0.6"/>
          <!-- Radiating Nova Shards -->
          ${Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r1 = 70;
            const r2 = 86 + Math.sin(i * 2.5) * 8;
            const lx = 100 + Math.cos(a - 0.08) * r1;
            const ly = 100 + Math.sin(a - 0.08) * r1;
            const rx = 100 + Math.cos(a + 0.08) * r1;
            const ry = 100 + Math.sin(a + 0.08) * r1;
            const tx = 100 + Math.cos(a) * r2;
            const ty = 100 + Math.sin(a) * r2;
            return `<polygon points="${lx.toFixed(1)},${ly.toFixed(1)} ${tx.toFixed(1)},${ty.toFixed(1)} ${rx.toFixed(1)},${ry.toFixed(1)}" fill="#ffd54f"/>`;
          }).join('')}
          <!-- Multi-vector attack trails -->
          ${Array.from({ length: 5 }, (_, i) => {
            const a = (i / 5) * Math.PI * 2 - Math.PI / 4;
            const tx = 100 + Math.cos(a) * 92;
            const ty = 100 + Math.sin(a) * 92;
            return `
              <line x1="100" y1="100" x2="${tx.toFixed(1)}" y2="${ty.toFixed(1)}" stroke="#ffea00" stroke-width="2" stroke-linecap="round"/>
              <circle cx="${tx.toFixed(1)}" cy="${ty.toFixed(1)}" r="4" fill="#ffffff"/>
            `;
          }).join('')}
          <!-- Cell Body -->
          <circle cx="100" cy="100" r="52" fill="url(#cn-body)" stroke="#ffd54f" stroke-width="2"/>
          <circle cx="100" cy="100" r="24" fill="#0288d1" opacity="0.8"/>
          <circle cx="100" cy="100" r="8" fill="#ffffff"/>
          <!-- Tier II badge -->
          <circle cx="162" cy="38" r="12" fill="#301500" stroke="#ffd54f" stroke-width="1.5"/>
          <text x="162" y="42" text-anchor="middle" fill="#ffd54f" font-size="10" font-family="'Share Tech Mono',monospace" font-weight="bold">II</text>
        </svg>
      `;

    case 'KINETIC_SWARM':
      return genericBranchIcon(
        size,
        '#38bdf8',
        '#0c2a3a',
        Array.from({ length: 9 }, (_, i) => {
          const a = (i / 9) * Math.PI * 2;
          const r = 62 + (i % 3) * 9;
          return `<circle cx="${(100 + Math.cos(a) * r).toFixed(1)}" cy="${(100 + Math.sin(a) * r).toFixed(1)}" r="5" fill="#ffffff"/><line x1="100" y1="100" x2="${(100 + Math.cos(a) * (r - 8)).toFixed(1)}" y2="${(100 + Math.sin(a) * (r - 8)).toFixed(1)}" stroke="#e0f2fe" stroke-width="1.5" opacity="0.6"/>`;
        }).join('')
      );

    case 'CRYO_CONTROL':
      return genericBranchIcon(
        size,
        '#67e8f9',
        '#0a2a33',
        Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return `<line x1="100" y1="100" x2="${(100 + Math.cos(a) * 80).toFixed(1)}" y2="${(100 + Math.sin(a) * 80).toFixed(1)}" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/><line x1="${(100 + Math.cos(a) * 52).toFixed(1)}" y1="${(100 + Math.sin(a) * 52).toFixed(1)}" x2="${(100 + Math.cos(a + 0.5) * 66).toFixed(1)}" y2="${(100 + Math.sin(a + 0.5) * 66).toFixed(1)}" stroke="#ffffff" stroke-width="2"/>`;
        }).join('')
      );

    case 'CORROSIVE_ACID':
      return genericBranchIcon(
        size,
        '#a3e635',
        '#1a2e05',
        Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2 + 0.3;
          const r = 60 + Math.sin(i * 2.1) * 14;
          return `<circle cx="${(100 + Math.cos(a) * r).toFixed(1)}" cy="${(100 + Math.sin(a) * r).toFixed(1)}" r="${(9 + (i % 3) * 3).toFixed(1)}" fill="#bef264" opacity="0.6"/>`;
        }).join('') + '<path d="M80,92 Q100,130 120,92" fill="none" stroke="#1a2e05" stroke-width="5" stroke-linecap="round"/>'
      );

    case 'THERMAL_PIERCING':
      return genericBranchIcon(
        size,
        '#fb923c',
        '#3a1400',
        '<polygon points="40,100 170,88 170,112" fill="#ffffff" stroke="#fb923c" stroke-width="2"/><line x1="48" y1="100" x2="160" y2="100" stroke="#ffedd5" stroke-width="2"/><circle cx="170" cy="100" r="6" fill="#ffffff"/>'
      );

    case 'PHAGOCYTIC_ENGULFMENT':
      return genericBranchIcon(
        size,
        '#fbbf24',
        '#3a2a00',
        '<path d="M100,58 Q126,62 132,88 Q136,112 112,126 Q92,136 74,120 Q62,104 72,86 Q80,70 100,58Z" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/><polygon points="104,74 92,104 102,104 96,128 116,94 106,94" fill="#ffffff"/>'
      );

    case 'OPSONIZE_BRITTLE_30':
      return genericBranchIcon(
        size,
        '#c4b5fd',
        '#2e1065',
        '<circle cx="100" cy="100" r="70" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="8 6"/><path d="M100,100 L82,78 M100,100 L120,84 M100,100 L116,120 M100,100 L80,114" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>'
      );

    case 'LYSOSOME_SPLASH':
      return genericBranchIcon(
        size,
        '#a78bfa',
        '#2e1065',
        Array.from({ length: 6 }, (_, i) => {
          const a = (i / 6) * Math.PI * 2 + 0.2;
          return `<circle cx="${(100 + Math.cos(a) * 70).toFixed(1)}" cy="${(100 + Math.sin(a) * 70).toFixed(1)}" r="10" fill="#ede9fe" opacity="0.85"/>`;
        }).join('') + '<circle cx="100" cy="100" r="74" fill="none" stroke="#ede9fe" stroke-width="1.5" stroke-dasharray="4 6" opacity="0.7"/>'
      );

    default:
      return '';
  }
}
