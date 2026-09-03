import { MapData, WorldCoord } from '@/core/types';

const CELL_SIZE = 48;
const COLS = 20;
const ROWS = 12;
const WIDTH = COLS * CELL_SIZE;  // 960
const HEIGHT = ROWS * CELL_SIZE; // 576

// Scale factor from preview coordinate system (400x300) to full game grid (960x576)
const SX = WIDTH / 400;   // 2.4
const SY = HEIGHT / 300;  // 1.92

function scaleCoord(x: number, y: number): WorldCoord {
  return { x: x * SX, y: y * SY };
}

function sampleCubicBezier(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  samples = 14
): WorldCoord[] {
  const points: WorldCoord[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const mt = 1 - t;
    const x = mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x;
    const y = mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y;
    points.push(scaleCoord(x, y));
  }
  return points;
}

function combineBezierSegments(segments: [{ x: number; y: number }, { x: number; y: number }, { x: number; y: number }, { x: number; y: number }][]): WorldCoord[] {
  const result: WorldCoord[] = [];
  for (let i = 0; i < segments.length; i++) {
    const [p0, p1, p2, p3] = segments[i]!;
    const pts = sampleCubicBezier(p0, p1, p2, p3, 14);
    if (i > 0) {
      pts.shift(); // Avoid duplicate junction points
    }
    result.push(...pts);
  }
  return result;
}

function computePathCells(waypoints: WorldCoord[], cellSize: number): { col: number; row: number }[] {
  const cellSet = new Set<string>();
  const cells: { col: number; row: number }[] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i]!;
    const p2 = waypoints[i + 1]!;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.hypot(dx, dy);
    const step = cellSize / 6;
    const steps = Math.max(1, Math.ceil(length / step));

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const col = Math.floor((p1.x + dx * t) / cellSize);
      const row = Math.floor((p1.y + dy * t) / cellSize);
      const key = `${col},${row}`;
      if (col >= 0 && col < COLS && row >= 0 && row < ROWS && !cellSet.has(key)) {
        cellSet.add(key);
        cells.push({ col, row });
      }
    }
  }

  return cells;
}

function computeMultiPathCells(routes: WorldCoord[][], cellSize: number): { col: number; row: number }[] {
  const cellSet = new Set<string>();
  const cells: { col: number; row: number }[] = [];
  for (const route of routes) {
    const routeCells = computePathCells(route, cellSize);
    for (const c of routeCells) {
      const key = `${c.col},${c.row}`;
      if (!cellSet.has(key)) {
        cellSet.add(key);
        cells.push(c);
      }
    }
  }
  return cells;
}

// -------------------------------------------------------------
// MAP 1: Vascular Run (S-curve flow through primary bloodstream)
// Preview path: M 30,150 C 80,150 80,60 140,60 C 200,60 200,240 260,240 C 320,240 320,100 370,100
// -------------------------------------------------------------
const vascularWaypoints = combineBezierSegments([
  [{ x: 30, y: 150 }, { x: 80, y: 150 }, { x: 80, y: 60 }, { x: 140, y: 60 }],
  [{ x: 140, y: 60 }, { x: 200, y: 60 }, { x: 200, y: 240 }, { x: 260, y: 240 }],
  [{ x: 260, y: 240 }, { x: 320, y: 240 }, { x: 320, y: 100 }, { x: 370, y: 100 }],
]);

export const VASCULAR_RUN_MAP: MapData = {
  id: 'VASCULAR_RUN',
  name: 'Vascular Run',
  description: 'A primary bloodstream conduit with balanced defensive curves.',
  theme: 'VASCULAR',
  cols: COLS,
  rows: ROWS,
  cellSize: CELL_SIZE,
  entryPosition: vascularWaypoints[0]!,
  corePosition: vascularWaypoints[vascularWaypoints.length - 1]!,
  waypoints: vascularWaypoints,
  pathGridCells: computePathCells(vascularWaypoints, CELL_SIZE),
  blockedGridCells: [
    { col: 1, row: 1 },
    { col: 2, row: 1 },
    { col: 8, row: 2 },
    { col: 9, row: 2 },
    { col: 16, row: 9 },
    { col: 17, row: 9 },
  ],
};

// -------------------------------------------------------------
// MAP 2: Lymph Spiral (Inward winding spiral)
// Preview path: Spirals gracefully from perimeter into center core (200, 170)
// -------------------------------------------------------------
const lymphWaypoints = combineBezierSegments([
  [{ x: 30, y: 150 }, { x: 30, y: 40 }, { x: 90, y: 20 }, { x: 200, y: 20 }],
  [{ x: 200, y: 20 }, { x: 340, y: 20 }, { x: 380, y: 90 }, { x: 380, y: 150 }],
  [{ x: 380, y: 150 }, { x: 380, y: 230 }, { x: 310, y: 280 }, { x: 200, y: 280 }],
  [{ x: 200, y: 280 }, { x: 110, y: 280 }, { x: 60, y: 240 }, { x: 60, y: 170 }],
  [{ x: 60, y: 170 }, { x: 60, y: 110 }, { x: 100, y: 80 }, { x: 160, y: 80 }],
  [{ x: 160, y: 80 }, { x: 220, y: 80 }, { x: 260, y: 110 }, { x: 260, y: 150 }],
  [{ x: 260, y: 150 }, { x: 260, y: 185 }, { x: 235, y: 205 }, { x: 200, y: 205 }],
  [{ x: 200, y: 205 }, { x: 172, y: 205 }, { x: 155, y: 188 }, { x: 155, y: 165 }],
  [{ x: 155, y: 165 }, { x: 155, y: 148 }, { x: 168, y: 138 }, { x: 185, y: 138 }],
  [{ x: 185, y: 138 }, { x: 200, y: 138 }, { x: 208, y: 146 }, { x: 205, y: 155 }],
  [{ x: 205, y: 155 }, { x: 205, y: 165 }, { x: 202, y: 170 }, { x: 200, y: 170 }],
]);

export const LYMPH_SPIRAL_MAP: MapData = {
  id: 'LYMPH_SPIRAL',
  name: 'Lymph Spiral',
  description: 'Inward winding lymphatic channel maximizing central tower coverage.',
  theme: 'LYMPHATIC',
  cols: COLS,
  rows: ROWS,
  cellSize: CELL_SIZE,
  entryPosition: lymphWaypoints[0]!,
  corePosition: lymphWaypoints[lymphWaypoints.length - 1]!,
  waypoints: lymphWaypoints,
  pathGridCells: computePathCells(lymphWaypoints, CELL_SIZE),
  blockedGridCells: [
    { col: 0, row: 0 },
    { col: 19, row: 0 },
    { col: 0, row: 11 },
    { col: 19, row: 11 },
  ],
};

// -------------------------------------------------------------
// MAP 3: Neural Fork (Multi-axon convergence and fork)
// -------------------------------------------------------------
const neuralRouteTop = combineBezierSegments([
  [{ x: 30, y: 60 }, { x: 80, y: 60 }, { x: 100, y: 110 }, { x: 150, y: 130 }],
  [{ x: 150, y: 130 }, { x: 200, y: 130 }, { x: 220, y: 130 }, { x: 260, y: 130 }],
  [{ x: 260, y: 130 }, { x: 310, y: 130 }, { x: 330, y: 80 }, { x: 370, y: 70 }],
]);

const neuralRouteMid = combineBezierSegments([
  [{ x: 30, y: 150 }, { x: 80, y: 150 }, { x: 110, y: 145 }, { x: 150, y: 130 }],
  [{ x: 150, y: 130 }, { x: 200, y: 130 }, { x: 220, y: 130 }, { x: 260, y: 130 }],
  [{ x: 260, y: 130 }, { x: 310, y: 130 }, { x: 330, y: 180 }, { x: 370, y: 200 }],
]);

const neuralRouteBot = combineBezierSegments([
  [{ x: 30, y: 240 }, { x: 80, y: 240 }, { x: 100, y: 170 }, { x: 150, y: 130 }],
  [{ x: 150, y: 130 }, { x: 200, y: 130 }, { x: 220, y: 130 }, { x: 260, y: 130 }],
  [{ x: 260, y: 130 }, { x: 310, y: 130 }, { x: 330, y: 180 }, { x: 370, y: 200 }],
]);

export const NEURAL_FORK_MAP: MapData = {
  id: 'NEURAL_FORK',
  name: 'Neural Fork',
  description: 'Converging nerve pathways requiring prioritized line defence.',
  theme: 'NEURAL',
  cols: COLS,
  rows: ROWS,
  cellSize: CELL_SIZE,
  entryPosition: neuralRouteMid[0]!,
  corePosition: neuralRouteMid[neuralRouteMid.length - 1]!,
  waypoints: neuralRouteMid,
  routes: [neuralRouteTop, neuralRouteMid, neuralRouteBot],
  pathGridCells: computeMultiPathCells([neuralRouteTop, neuralRouteMid, neuralRouteBot], CELL_SIZE),
  blockedGridCells: [
    { col: 5, row: 5 },
    { col: 6, row: 5 },
  ],
};

// -------------------------------------------------------------
// MAP 4: Pulmonary Convergence (Dual Bronchial Corridors)
// -------------------------------------------------------------
const pulmonaryRouteA = combineBezierSegments([
  [{ x: 30, y: 80 }, { x: 70, y: 80 }, { x: 100, y: 100 }, { x: 130, y: 130 }],
  [{ x: 130, y: 130 }, { x: 155, y: 155 }, { x: 175, y: 165 }, { x: 200, y: 170 }],
  [{ x: 200, y: 170 }, { x: 240, y: 170 }, { x: 290, y: 155 }, { x: 340, y: 130 }],
  [{ x: 340, y: 130 }, { x: 355, y: 120 }, { x: 365, y: 105 }, { x: 370, y: 90 }],
]);

const pulmonaryRouteB = combineBezierSegments([
  [{ x: 30, y: 220 }, { x: 70, y: 220 }, { x: 100, y: 200 }, { x: 130, y: 170 }],
  [{ x: 130, y: 170 }, { x: 155, y: 145 }, { x: 175, y: 175 }, { x: 200, y: 170 }],
  [{ x: 200, y: 170 }, { x: 240, y: 170 }, { x: 290, y: 155 }, { x: 340, y: 130 }],
  [{ x: 340, y: 130 }, { x: 355, y: 140 }, { x: 365, y: 155 }, { x: 370, y: 170 }],
]);

export const PULMONARY_CONVERGENCE_MAP: MapData = {
  id: 'PULMONARY_CONVERGENCE',
  name: 'Pulmonary Junction',
  description: 'Dual-bronchial multi-entry corridors converging into the central respiratory core.',
  theme: 'PULMONARY',
  cols: COLS,
  rows: ROWS,
  cellSize: CELL_SIZE,
  entryPosition: pulmonaryRouteA[0]!,
  corePosition: pulmonaryRouteA[pulmonaryRouteA.length - 1]!,
  waypoints: pulmonaryRouteA,
  routes: [pulmonaryRouteA, pulmonaryRouteB],
  pathGridCells: computeMultiPathCells([pulmonaryRouteA, pulmonaryRouteB], CELL_SIZE),
  blockedGridCells: [
    { col: 3, row: 5 },
    { col: 3, row: 6 },
    { col: 16, row: 2 },
    { col: 16, row: 8 },
  ],
};

export const ALL_MAPS: Record<string, MapData> = {
  VASCULAR_RUN: VASCULAR_RUN_MAP,
  LYMPH_SPIRAL: LYMPH_SPIRAL_MAP,
  NEURAL_FORK: NEURAL_FORK_MAP,
  PULMONARY_CONVERGENCE: PULMONARY_CONVERGENCE_MAP,
};
