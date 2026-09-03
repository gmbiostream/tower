import { describe, it, expect } from 'vitest';
import { MapGrid } from '@/core/map';
import { VASCULAR_RUN_MAP, LYMPH_SPIRAL_MAP, NEURAL_FORK_MAP } from '@/data/maps';

describe('MapGrid and Traversal', () => {
  const grid = new MapGrid(VASCULAR_RUN_MAP);

  it('should initialize with valid positive path length', () => {
    expect(grid.totalPathLength).toBeGreaterThan(0);
    expect(grid.segments.length).toBe(VASCULAR_RUN_MAP.waypoints.length - 1);
  });

  it('should correctly convert between cell and world coordinates', () => {
    const world = grid.cellToWorld(2, 3);
    expect(world.x).toBe((2 + 0.5) * 48);
    expect(world.y).toBe((3 + 0.5) * 48);

    const cell = grid.worldToCell(world.x, world.y);
    expect(cell.col).toBe(2);
    expect(cell.row).toBe(3);
  });

  it('should evaluate start, midpoint, and end of path correctly', () => {
    const start = grid.getPositionAlongPath(0);
    expect(start.progress).toBe(0);
    expect(start.completed).toBe(false);
    expect(start.position.x).toBeCloseTo(VASCULAR_RUN_MAP.entryPosition.x);
    expect(start.position.y).toBeCloseTo(VASCULAR_RUN_MAP.entryPosition.y);

    const end = grid.getPositionAlongPath(grid.totalPathLength);
    expect(end.progress).toBe(1);
    expect(end.completed).toBe(true);
    expect(end.position.x).toBeCloseTo(VASCULAR_RUN_MAP.corePosition.x);
    expect(end.position.y).toBeCloseTo(VASCULAR_RUN_MAP.corePosition.y);
  });

  it('should correctly identify buildability reasons', () => {
    // Check out of bounds
    expect(grid.checkBuildability(-1, 0).reason).toBe('OUT_OF_BOUNDS');
    expect(grid.checkBuildability(0, -1).reason).toBe('OUT_OF_BOUNDS');
    expect(grid.checkBuildability(99, 99).reason).toBe('OUT_OF_BOUNDS');

    // Check path cell
    expect(grid.checkBuildability(0, 3).reason).toBe('PATH');

    // Check blocked cell (e.g., 1, 1)
    expect(grid.checkBuildability(1, 1).reason).toBe('BLOCKED');

    // Check occupied cell
    const occupied = new Set(['2,2']);
    expect(grid.checkBuildability(2, 2, occupied).reason).toBe('OCCUPIED');

    // Check valid buildable cell
    expect(grid.checkBuildability(0, 0).reason).toBe('VALID');
    expect(grid.checkBuildability(0, 0).valid).toBe(true);
  });
});

describe('Path cell rasterization', () => {
  it('should only mark cells touched by the diagonal segment on NEURAL_FORK', () => {
    const grid = new MapGrid(NEURAL_FORK_MAP);

    // Far corners of the diagonal segment's bounding box must be buildable
    expect(grid.isPathCell(10, 2)).toBe(false);
    expect(grid.checkBuildability(10, 2).reason).toBe('VALID');
    expect(grid.isPathCell(7, 6)).toBe(false);
    expect(grid.checkBuildability(7, 6).reason).toBe('VALID');

    // Cells the diagonal line actually passes through must be PATH
    for (const [col, row] of [
      [7, 2],
      [7, 3],
      [8, 3],
      [8, 4],
      [9, 4],
      [9, 5],
      [10, 5],
      [10, 6],
    ] as const) {
      expect(grid.isPathCell(col, row)).toBe(true);
    }
  });

  it('should mark exactly the straight rows/columns for axis-aligned maps', () => {
    // VASCULAR_RUN: waypoint corridor cells, no extras
    const vascular = new MapGrid(VASCULAR_RUN_MAP);
    const vascularExpected = new Set<string>();
    for (let col = 0; col <= 5; col++) vascularExpected.add(`${col},3`);
    for (let row = 3; row <= 8; row++) vascularExpected.add(`5,${row}`);
    for (let col = 5; col <= 12; col++) vascularExpected.add(`${col},8`);
    for (let row = 4; row <= 8; row++) vascularExpected.add(`12,${row}`);
    for (let col = 12; col <= 19; col++) vascularExpected.add(`${col},4`);

    const vascularActual = new Set(
      VASCULAR_RUN_MAP.pathGridCells.map((c) => `${c.col},${c.row}`)
    );
    expect(vascularActual).toEqual(vascularExpected);
    expect(vascular.isPathCell(0, 3)).toBe(true);

    // LYMPH_SPIRAL: all segments axis-aligned, spot check corners and count
    const lymph = new MapGrid(LYMPH_SPIRAL_MAP);
    expect(lymph.isPathCell(1, 1)).toBe(true);
    expect(lymph.isPathCell(18, 10)).toBe(true);
    expect(lymph.isPathCell(8, 7)).toBe(true);
    expect(lymph.isPathCell(2, 2)).toBe(false);
    expect(LYMPH_SPIRAL_MAP.pathGridCells.length).toBe(68);
  });
});
