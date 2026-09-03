import { MapData } from '@/core/types';

function computePathCells(waypoints: { x: number; y: number }[], cellSize: number): { col: number; row: number }[] {
  const cellSet = new Set<string>();
  const cells: { col: number; row: number }[] = [];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const p1 = waypoints[i]!;
    const p2 = waypoints[i + 1]!;

    // Rasterize the actual line by dense sampling so diagonal segments only
    // mark cells the line passes through (not the whole bounding box).
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.hypot(dx, dy);
    const step = cellSize / 4;
    const steps = Math.max(1, Math.ceil(length / step));

    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const col = Math.floor((p1.x + dx * t) / cellSize);
      const row = Math.floor((p1.y + dy * t) / cellSize);
      const key = `${col},${row}`;
      if (!cellSet.has(key)) {
        cellSet.add(key);
        cells.push({ col, row });
      }
    }
  }

  return cells;
}

const CELL_SIZE = 48;
const COLS = 20;
const ROWS = 12;

// Map 1: Vascular Run (S-curve flow through bloodstream)
const vascularWaypoints = [
  { x: 0 * CELL_SIZE + CELL_SIZE / 2, y: 3 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 5 * CELL_SIZE + CELL_SIZE / 2, y: 3 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 5 * CELL_SIZE + CELL_SIZE / 2, y: 8 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 12 * CELL_SIZE + CELL_SIZE / 2, y: 8 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 12 * CELL_SIZE + CELL_SIZE / 2, y: 4 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 19 * CELL_SIZE + CELL_SIZE / 2, y: 4 * CELL_SIZE + CELL_SIZE / 2 },
];

export const VASCULAR_RUN_MAP: MapData = {
  id: 'VASCULAR_RUN',
  name: 'Vascular Run',
  description: 'A primary bloodstream conduit with balanced defensive curves.',
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

// Map 2: Lymph Spiral (Inward winding spiral)
const lymphWaypoints = [
  { x: 1 * CELL_SIZE + CELL_SIZE / 2, y: 1 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 18 * CELL_SIZE + CELL_SIZE / 2, y: 1 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 18 * CELL_SIZE + CELL_SIZE / 2, y: 10 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 3 * CELL_SIZE + CELL_SIZE / 2, y: 10 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 3 * CELL_SIZE + CELL_SIZE / 2, y: 4 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 14 * CELL_SIZE + CELL_SIZE / 2, y: 4 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 14 * CELL_SIZE + CELL_SIZE / 2, y: 7 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 8 * CELL_SIZE + CELL_SIZE / 2, y: 7 * CELL_SIZE + CELL_SIZE / 2 },
];

export const LYMPH_SPIRAL_MAP: MapData = {
  id: 'LYMPH_SPIRAL',
  name: 'Lymph Spiral',
  description: 'Inward winding lymphatic channel maximizing central tower coverage.',
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

// Map 3: Neural Fork (Dual route converging)
const neuralWaypoints = [
  { x: 0 * CELL_SIZE + CELL_SIZE / 2, y: 2 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 7 * CELL_SIZE + CELL_SIZE / 2, y: 2 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 10 * CELL_SIZE + CELL_SIZE / 2, y: 6 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 14 * CELL_SIZE + CELL_SIZE / 2, y: 6 * CELL_SIZE + CELL_SIZE / 2 },
  { x: 19 * CELL_SIZE + CELL_SIZE / 2, y: 6 * CELL_SIZE + CELL_SIZE / 2 },
];

export const NEURAL_FORK_MAP: MapData = {
  id: 'NEURAL_FORK',
  name: 'Neural Fork',
  description: 'Converging nerve pathways requiring prioritized line defence.',
  cols: COLS,
  rows: ROWS,
  cellSize: CELL_SIZE,
  entryPosition: neuralWaypoints[0]!,
  corePosition: neuralWaypoints[neuralWaypoints.length - 1]!,
  waypoints: neuralWaypoints,
  pathGridCells: computePathCells(neuralWaypoints, CELL_SIZE),
  blockedGridCells: [
    { col: 5, row: 5 },
    { col: 6, row: 5 },
  ],
};

export const ALL_MAPS: Record<string, MapData> = {
  VASCULAR_RUN: VASCULAR_RUN_MAP,
  LYMPH_SPIRAL: LYMPH_SPIRAL_MAP,
  NEURAL_FORK: NEURAL_FORK_MAP,
};
