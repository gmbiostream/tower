/**
 * Vector SVG Map Previews for Cyber-Immunology TD.
 * 
 * 
 * 
 * Faithfully converted from the biological sector map designs.
 */

export interface MapPreviewMeta {
  id: string;
  name: string;
  type: string;
  description: string;
  color: string;
  borderColor: string;
  accentGlow: string;
}

export const MAP_PREVIEW_META: Record<string, MapPreviewMeta> = {
  VASCULAR_RUN: {
    id: 'VASCULAR_RUN',
    name: 'Vascular Run',
    type: 'VASCULAR',
    description: 'A primary bloodstream conduit with balanced defensive curves.',
    color: '#c0392b',
    borderColor: '#7b1010',
    accentGlow: 'rgba(231, 76, 60, 0.4)',
  },
  LYMPH_SPIRAL: {
    id: 'LYMPH_SPIRAL',
    name: 'Lymph Spiral',
    type: 'LYMPHATIC',
    description: 'Inward winding lymphatic channel maximizing central tower coverage.',
    color: '#16a085',
    borderColor: '#0d5c3c',
    accentGlow: 'rgba(26, 188, 156, 0.4)',
  },
  NEURAL_FORK: {
    id: 'NEURAL_FORK',
    name: 'Neural Fork',
    type: 'NEURAL',
    description: 'Converging nerve pathways requiring prioritized line defence.',
    color: '#d4a017',
    borderColor: '#4a3800',
    accentGlow: 'rgba(241, 196, 15, 0.4)',
  },
  PULMONARY_CONVERGENCE: {
    id: 'PULMONARY_CONVERGENCE',
    name: 'Pulmonary Junction',
    type: 'PULMONARY',
    description: 'Dual-bronchial multi-entry corridors converging into the central respiratory core.',
    color: '#1a6fa0',
    borderColor: '#0d2f4a',
    accentGlow: 'rgba(0, 170, 255, 0.4)',
  },
};

export function renderVascularRunSvg(_width = 400, _height = 240): string {
  const path = 'M 30,150 C 80,150 80,60 140,60 C 200,60 200,240 260,240 C 320,240 320,100 370,100';
  const bloodCells = [
    [80, 100, 8], [200, 180, 6], [310, 130, 7], [150, 220, 5], [340, 200, 9],
    [60, 220, 5], [280, 60, 6], [120, 160, 4],
  ];
  const towerSpots = [
    [105, 50], [175, 145], [230, 240], [295, 195], [340, 145],
    [85, 195], [155, 70], [265, 130],
  ];

  return `
    <svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto block select-none pointer-events-none rounded-t-xl">
      <defs>
        <pattern id="vgrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0d2040" stroke-width="0.5" />
        </pattern>
        <filter id="vglow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="vglow2">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="vbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#060f1e" />
          <stop offset="100%" stop-color="#09162a" />
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="400" height="300" fill="url(#vbg)" rx="8" />
      <rect width="400" height="300" fill="url(#vgrid)" rx="8" />

      <!-- Organic blood cell decorations -->
      ${bloodCells
        .map(
          ([cx, cy, r]) =>
            `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${(r ?? 6) * 0.6}" fill="#c0392b" fill-opacity="0.15" />`
        )
        .join('')}

      <!-- Path glow layers -->
      <path d="${path}" fill="none" stroke="#ff2a2a" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" opacity="0.08" />
      <path d="${path}" fill="none" stroke="#e74c3c" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" opacity="0.15" />

      <!-- Main vessel walls -->
      <path d="${path}" fill="none" stroke="#7b1010" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
      <path d="${path}" fill="none" stroke="#c0392b" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Inner flow channel -->
      <path d="${path}" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="6 4" opacity="0.7" filter="url(#vglow)" />
      <path d="${path}" fill="none" stroke="#ff9999" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.5" />

      <!-- Tower placement spots -->
      ${towerSpots
        .map(
          ([cx, cy]) => `
        <g>
          <circle cx="${cx}" cy="${cy}" r="7" fill="#0d1f35" stroke="#c0392b" stroke-width="1" opacity="0.6" />
          <circle cx="${cx}" cy="${cy}" r="3" fill="#e74c3c" opacity="0.4" />
        </g>
      `
        )
        .join('')}

      <!-- START marker -->
      <g filter="url(#vglow2)">
        <circle cx="30" cy="150" r="12" fill="#c0392b" opacity="0.3" />
        <circle cx="30" cy="150" r="7" fill="#e74c3c" />
        <text x="30" y="154" text-anchor="middle" fill="white" font-size="7" font-family="'Share Tech Mono', monospace" font-weight="bold">IN</text>
      </g>

      <!-- END marker -->
      <g filter="url(#vglow2)">
        <circle cx="370" cy="100" r="12" fill="#ff2a2a" opacity="0.3" />
        <circle cx="370" cy="100" r="7" fill="#ff4444" />
        <text x="370" y="104" text-anchor="middle" fill="white" font-size="6" font-family="'Share Tech Mono', monospace" font-weight="bold">OUT</text>
      </g>

      <!-- Label -->
      <text x="12" y="280" fill="#e74c3c" font-size="9" font-family="'Share Tech Mono', monospace" opacity="0.7">VASCULAR RUN</text>
      <text x="12" y="293" fill="#7b1010" font-size="7" font-family="'Share Tech Mono', monospace">BLOODSTREAM CONDUIT // BALANCED CURVES</text>
    </svg>
  `;
}

export function renderLymphSpiralSvg(_width = 400, _height = 240): string {
  const cx = 200;
  const cy = 150;
  const spiralPath = `
    M 30,150
    C 30,40 90,20 200,20
    C 340,20 380,90 380,150
    C 380,230 310,280 200,280
    C 110,280 60,240 60,170
    C 60,110 100,80 160,80
    C 220,80 260,110 260,150
    C 260,185 235,205 200,205
    C 172,205 155,188 155,165
    C 155,148 168,138 185,138
    C 200,138 210,147 210,158
    C 210,165 205,170 200,170
  `;
  const ambientNodes = [[60, 60], [340, 70], [350, 230], [50, 240], [200, 50], [200, 265]];
  const towerSpots = [
    [115, 28], [285, 28], [370, 100], [380, 205], [285, 278], [115, 278], [35, 205], [35, 100],
    [100, 80], [300, 80], [300, 220], [100, 220],
  ];

  return `
    <svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto block select-none pointer-events-none rounded-t-xl">
      <defs>
        <pattern id="lgrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#0a1f18" stroke-width="0.5" />
        </pattern>
        <filter id="lglow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="lglow2">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="lbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#050f0c" />
          <stop offset="100%" stop-color="#07161a" />
        </linearGradient>
      </defs>

      <rect width="400" height="300" fill="url(#lbg)" rx="8" />
      <rect width="400" height="300" fill="url(#lgrid)" rx="8" />

      <!-- Ambient lymph node hints -->
      ${ambientNodes
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#1abc9c" fill-opacity="0.12" />`)
        .join('')}

      <!-- Glow halos -->
      <path d="${spiralPath}" fill="none" stroke="#00ff88" stroke-width="20" stroke-linecap="round" opacity="0.05" />
      <path d="${spiralPath}" fill="none" stroke="#1abc9c" stroke-width="12" stroke-linecap="round" opacity="0.12" />

      <!-- Channel walls -->
      <path d="${spiralPath}" fill="none" stroke="#0d5c3c" stroke-width="9" stroke-linecap="round" />
      <path d="${spiralPath}" fill="none" stroke="#16a085" stroke-width="7" stroke-linecap="round" />

      <!-- Inner glow flow -->
      <path d="${spiralPath}" fill="none" stroke="#2ecc71" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="5 6" opacity="0.8" filter="url(#lglow)" />
      <path d="${spiralPath}" fill="none" stroke="#a8ffda" stroke-width="0.8" stroke-linecap="round" opacity="0.4" />

      <!-- Tower spots along outer ring -->
      ${towerSpots
        .map(
          ([x, y]) => `
        <g>
          <circle cx="${x}" cy="${y}" r="6" fill="#07201a" stroke="#16a085" stroke-width="1" opacity="0.65" />
          <circle cx="${x}" cy="${y}" r="2.5" fill="#2ecc71" opacity="0.45" />
        </g>
      `
        )
        .join('')}

      <!-- Central tower marker — maximize central coverage -->
      <g filter="url(#lglow2)">
        <circle cx="${cx}" cy="${cy}" r="18" fill="#1abc9c" opacity="0.1" />
        <circle cx="${cx}" cy="${cy}" r="10" fill="#0d5c3c" stroke="#2ecc71" stroke-width="1.5" />
        <text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="#2ecc71" font-size="8" font-family="'Share Tech Mono', monospace">CORE</text>
      </g>

      <!-- START -->
      <g filter="url(#lglow2)">
        <circle cx="30" cy="150" r="10" fill="#2ecc71" opacity="0.25" />
        <circle cx="30" cy="150" r="6" fill="#1abc9c" />
        <text x="30" y="154" text-anchor="middle" fill="white" font-size="6" font-family="'Share Tech Mono', monospace">IN</text>
      </g>

      <text x="12" y="280" fill="#16a085" font-size="9" font-family="'Share Tech Mono', monospace" opacity="0.7">LYMPH SPIRAL</text>
      <text x="12" y="293" fill="#0d5c3c" font-size="7" font-family="'Share Tech Mono', monospace">LYMPHATIC CHANNEL // INWARD WINDING</text>
    </svg>
  `;
}

export function renderNeuralForkSvg(_width = 400, _height = 240): string {
  const topBranch = 'M 30,60 C 80,60 100,110 150,130';
  const midBranch = 'M 30,150 C 80,150 110,145 150,130';
  const botBranch = 'M 30,240 C 80,240 100,170 150,130';
  const mainAxon = 'M 150,130 C 200,130 220,130 260,130';
  const outTop = 'M 260,130 C 310,130 330,80 370,70';
  const outBot = 'M 260,130 C 310,130 330,180 370,200';
  const allPaths = [topBranch, midBranch, botBranch, mainAxon, outTop, outBot];

  const synapses = [[60, 100], [60, 150], [60, 200], [205, 130], [355, 90], [355, 175]];
  const towerSpots = [
    [55, 30], [55, 278], [180, 70], [180, 195], [325, 45], [325, 220], [230, 100], [230, 165],
  ];

  return `
    <svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto block select-none pointer-events-none rounded-t-xl">
      <defs>
        <pattern id="ngrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#14120a" stroke-width="0.5" />
        </pattern>
        <filter id="nglow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="nglow2">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="nbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0b0b04" />
          <stop offset="100%" stop-color="#121108" />
        </linearGradient>
      </defs>

      <rect width="400" height="300" fill="url(#nbg)" rx="8" />
      <rect width="400" height="300" fill="url(#ngrid)" rx="8" />

      <!-- Synapse pulse nodes decoration -->
      ${synapses.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#f1c40f" fill-opacity="0.2" />`).join('')}
      ${synapses
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="none" stroke="#f1c40f" stroke-width="0.5" opacity="0.15" />`)
        .join('')}

      <!-- Glow halos per path -->
      ${allPaths
        .map(
          (p) => `
        <path d="${p}" fill="none" stroke="#f1c40f" stroke-width="18" stroke-linecap="round" opacity="0.04" />
        <path d="${p}" fill="none" stroke="#f39c12" stroke-width="10" stroke-linecap="round" opacity="0.10" />
      `
        )
        .join('')}

      <!-- Neural sheath walls -->
      ${allPaths
        .map(
          (p) => `
        <path d="${p}" fill="none" stroke="#4a3800" stroke-width="8" stroke-linecap="round" />
        <path d="${p}" fill="none" stroke="#d4a017" stroke-width="6" stroke-linecap="round" />
      `
        )
        .join('')}

      <!-- Electrical pulse dashes -->
      ${allPaths
        .map(
          (p) => `
        <path d="${p}" fill="none" stroke="#ffe566" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 7" opacity="0.75" filter="url(#nglow)" />
        <path d="${p}" fill="none" stroke="#fff5b0" stroke-width="0.8" stroke-linecap="round" opacity="0.35" />
      `
        )
        .join('')}

      <!-- Tower spots -->
      ${towerSpots
        .map(
          ([x, y]) => `
        <g>
          <circle cx="${x}" cy="${y}" r="6" fill="#110f00" stroke="#d4a017" stroke-width="1" opacity="0.6" />
          <circle cx="${x}" cy="${y}" r="2.5" fill="#f1c40f" opacity="0.4" />
        </g>
      `
        )
        .join('')}

      <!-- Convergence node -->
      <g filter="url(#nglow2)">
        <circle cx="150" cy="130" r="14" fill="#f1c40f" opacity="0.12" />
        <circle cx="150" cy="130" r="7" fill="#4a3800" stroke="#f1c40f" stroke-width="1.5" />
        <circle cx="150" cy="130" r="3" fill="#ffe566" />
      </g>

      <!-- Fork node -->
      <g filter="url(#nglow2)">
        <circle cx="260" cy="130" r="14" fill="#f1c40f" opacity="0.12" />
        <circle cx="260" cy="130" r="7" fill="#4a3800" stroke="#f1c40f" stroke-width="1.5" />
        <circle cx="260" cy="130" r="3" fill="#ffe566" />
      </g>

      <!-- Entry markers -->
      ${[[30, 60], [30, 150], [30, 240]]
        .map(
          ([x, y]) => `
        <g filter="url(#nglow2)">
          <circle cx="${x}" cy="${y}" r="9" fill="#f1c40f" opacity="0.2" />
          <circle cx="${x}" cy="${y}" r="5.5" fill="#d4a017" />
          <text x="${x}" y="${(y ?? 0) + 3}" text-anchor="middle" fill="#0b0b04" font-size="5.5" font-family="'Share Tech Mono', monospace" font-weight="bold">IN</text>
        </g>
      `
        )
        .join('')}

      <!-- Exit markers -->
      ${[[370, 70], [370, 200]]
        .map(
          ([x, y]) => `
        <g filter="url(#nglow2)">
          <circle cx="${x}" cy="${y}" r="9" fill="#f1c40f" opacity="0.2" />
          <circle cx="${x}" cy="${y}" r="5.5" fill="#e67e22" />
          <text x="${x}" y="${(y ?? 0) + 3}" text-anchor="middle" fill="white" font-size="4.5" font-family="'Share Tech Mono', monospace" font-weight="bold">OUT</text>
        </g>
      `
        )
        .join('')}

      <text x="12" y="280" fill="#d4a017" font-size="9" font-family="'Share Tech Mono', monospace" opacity="0.7">NEURAL FORK</text>
      <text x="12" y="293" fill="#4a3800" font-size="7" font-family="'Share Tech Mono', monospace">NERVE PATHWAYS // PRIORITIZED LINE DEFENCE</text>
    </svg>
  `;
}

export function renderPulmonaryJunctionSvg(_width = 400, _height = 240): string {
  const leftBronchus = 'M 30,80 C 70,80 100,100 130,130 C 155,155 175,165 200,170';
  const rightBronchus = 'M 30,220 C 70,220 100,200 130,170 C 155,145 175,175 200,170';
  const mainTrachea = 'M 200,170 C 240,170 290,155 340,130';
  const topOut = 'M 340,130 C 355,120 365,105 370,90';
  const botOut = 'M 340,130 C 355,140 365,155 370,170';
  const allPaths = [leftBronchus, rightBronchus, mainTrachea, topOut, botOut];

  const alveoli = [
    [55, 70], [80, 55], [105, 75], [65, 100], [90, 85],
    [55, 215], [80, 230], [105, 215], [65, 195], [90, 205],
    [280, 110], [305, 140], [320, 110], [260, 130],
  ];

  const towerSpots = [
    [55, 30], [55, 270], [155, 40], [155, 265], [290, 55], [290, 215], [355, 60], [355, 205],
    [175, 115], [175, 230],
  ];

  return `
    <svg viewBox="0 0 400 300" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" class="w-full h-auto block select-none pointer-events-none rounded-t-xl">
      <defs>
        <pattern id="pgrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#080e1f" stroke-width="0.5" />
        </pattern>
        <filter id="pglow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="pglow2">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="pbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#050a18" />
          <stop offset="100%" stop-color="#080f22" />
        </linearGradient>
        <radialGradient id="lungL" cx="30%" cy="45%" r="35%">
          <stop offset="0%" stop-color="#1a6fa0" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#1a6fa0" stop-opacity="0" />
        </radialGradient>
        <radialGradient id="lungR" cx="30%" cy="65%" r="35%">
          <stop offset="0%" stop-color="#1a6fa0" stop-opacity="0.08" />
          <stop offset="100%" stop-color="#1a6fa0" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="400" height="300" fill="url(#pbg)" rx="8" />
      <rect width="400" height="300" fill="url(#pgrid)" rx="8" />

      <!-- Lung lobe outlines -->
      <ellipse cx="100" cy="90" rx="70" ry="55" fill="none" stroke="#1a6fa0" stroke-width="0.8" opacity="0.15" />
      <ellipse cx="100" cy="215" rx="70" ry="55" fill="none" stroke="#1a6fa0" stroke-width="0.8" opacity="0.15" />
      <rect width="400" height="300" fill="url(#lungL)" rx="8" />
      <rect width="400" height="300" fill="url(#lungR)" rx="8" />

      <!-- Alveoli decorations -->
      ${alveoli
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="none" stroke="#2980b9" stroke-width="0.6" opacity="0.3" />`)
        .join('')}

      <!-- Glow halos -->
      ${allPaths
        .map(
          (p) => `
        <path d="${p}" fill="none" stroke="#00aaff" stroke-width="20" stroke-linecap="round" opacity="0.05" />
        <path d="${p}" fill="none" stroke="#2980b9" stroke-width="12" stroke-linecap="round" opacity="0.12" />
      `
        )
        .join('')}

      <!-- Bronchial tube walls -->
      ${allPaths
        .map(
          (p) => `
        <path d="${p}" fill="none" stroke="#0d2f4a" stroke-width="9" stroke-linecap="round" />
        <path d="${p}" fill="none" stroke="#1a6fa0" stroke-width="7" stroke-linecap="round" />
      `
        )
        .join('')}

      <!-- Air flow dashes -->
      ${allPaths
        .map(
          (p) => `
        <path d="${p}" fill="none" stroke="#5dade2" stroke-width="2" stroke-linecap="round" stroke-dasharray="6 5" opacity="0.8" filter="url(#pglow)" />
        <path d="${p}" fill="none" stroke="#aed6f1" stroke-width="0.8" stroke-linecap="round" opacity="0.35" />
      `
        )
        .join('')}

      <!-- Tower spots -->
      ${towerSpots
        .map(
          ([x, y]) => `
        <g>
          <circle cx="${x}" cy="${y}" r="6" fill="#06111e" stroke="#1a6fa0" stroke-width="1" opacity="0.6" />
          <circle cx="${x}" cy="${y}" r="2.5" fill="#5dade2" opacity="0.45" />
        </g>
      `
        )
        .join('')}

      <!-- Respiratory core (merge node) -->
      <g filter="url(#pglow2)">
        <circle cx="200" cy="170" r="18" fill="#2980b9" opacity="0.1" />
        <circle cx="200" cy="170" r="10" fill="#0d2f4a" stroke="#5dade2" stroke-width="1.5" />
        <text x="200" y="167" text-anchor="middle" fill="#5dade2" font-size="5.5" font-family="'Share Tech Mono', monospace">RESP</text>
        <text x="200" y="176" text-anchor="middle" fill="#5dade2" font-size="5.5" font-family="'Share Tech Mono', monospace">CORE</text>
      </g>

      <!-- Branch node -->
      <g filter="url(#pglow2)">
        <circle cx="340" cy="130" r="12" fill="#2980b9" opacity="0.12" />
        <circle cx="340" cy="130" r="6.5" fill="#0d2f4a" stroke="#5dade2" stroke-width="1.5" />
        <circle cx="340" cy="130" r="2.5" fill="#aed6f1" />
      </g>

      <!-- Entry markers -->
      ${[[30, 80], [30, 220]]
        .map(
          ([x, y]) => `
        <g filter="url(#pglow2)">
          <circle cx="${x}" cy="${y}" r="10" fill="#2980b9" opacity="0.2" />
          <circle cx="${x}" cy="${y}" r="6" fill="#1a6fa0" />
          <text x="${x}" y="${(y ?? 0) + 3}" text-anchor="middle" fill="white" font-size="5.5" font-family="'Share Tech Mono', monospace">IN</text>
        </g>
      `
        )
        .join('')}

      <!-- Exit markers -->
      ${[[370, 90], [370, 170]]
        .map(
          ([x, y]) => `
        <g filter="url(#pglow2)">
          <circle cx="${x}" cy="${y}" r="10" fill="#00aaff" opacity="0.2" />
          <circle cx="${x}" cy="${y}" r="6" fill="#2471a3" />
          <text x="${x}" y="${(y ?? 0) + 3}" text-anchor="middle" fill="white" font-size="4.5" font-family="'Share Tech Mono', monospace">OUT</text>
        </g>
      `
        )
        .join('')}

      <text x="12" y="280" fill="#1a6fa0" font-size="9" font-family="'Share Tech Mono', monospace" opacity="0.7">PULMONARY JUNCTION</text>
      <text x="12" y="293" fill="#0d2f4a" font-size="7" font-family="'Share Tech Mono', monospace">DUAL-BRONCHIAL CORRIDORS // RESPIRATORY CORE</text>
    </svg>
  `;
}

export function getMapPreviewSvg(mapId: string, width = 400, height = 240): string {
  switch (mapId) {
    case 'VASCULAR_RUN':
      return renderVascularRunSvg(width, height);
    case 'LYMPH_SPIRAL':
      return renderLymphSpiralSvg(width, height);
    case 'NEURAL_FORK':
      return renderNeuralForkSvg(width, height);
    case 'PULMONARY_CONVERGENCE':
      return renderPulmonaryJunctionSvg(width, height);
    default:
      return renderVascularRunSvg(width, height);
  }
}
