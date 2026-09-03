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

    default:
      return '';
  }
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

    default:
      return '';
  }
}
