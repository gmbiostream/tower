import { describe, it, expect } from 'vitest';
import { MapGrid } from '@/core/map';
import { VASCULAR_RUN_MAP, LYMPH_SPIRAL_MAP, NEURAL_FORK_MAP, PULMONARY_CONVERGENCE_MAP } from '@/data/maps';

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

  it('should correctly support multi-route map traversal on PULMONARY_CONVERGENCE', () => {
    const pulmonaryGrid = new MapGrid(PULMONARY_CONVERGENCE_MAP);
    expect(PULMONARY_CONVERGENCE_MAP.routes).toBeDefined();
    expect(PULMONARY_CONVERGENCE_MAP.routes!.length).toBe(2);

    // Route 0 start
    const r0Start = pulmonaryGrid.getPositionAlongPath(0, 0);
    expect(r0Start.position.x).toBeCloseTo(PULMONARY_CONVERGENCE_MAP.routes![0]![0]!.x);
    expect(r0Start.position.y).toBeCloseTo(PULMONARY_CONVERGENCE_MAP.routes![0]![0]!.y);

    // Route 1 start
    const r1Start = pulmonaryGrid.getPositionAlongPath(0, 1);
    expect(r1Start.position.x).toBeCloseTo(PULMONARY_CONVERGENCE_MAP.routes![1]![0]!.x);
    expect(r1Start.position.y).toBeCloseTo(PULMONARY_CONVERGENCE_MAP.routes![1]![0]!.y);

    // Route 1 end
    const r1Len = pulmonaryGrid.getPathLength(1);
    const r1End = pulmonaryGrid.getPositionAlongPath(r1Len, 1);
    expect(r1End.completed).toBe(true);
    const r1ExpectedEnd = PULMONARY_CONVERGENCE_MAP.routes![1]![PULMONARY_CONVERGENCE_MAP.routes![1]!.length - 1]!;
    expect(r1End.position.x).toBeCloseTo(r1ExpectedEnd.x);
    expect(r1End.position.y).toBeCloseTo(r1ExpectedEnd.y);
  });

  it('should correctly identify buildability reasons', () => {
    // Check out of bounds
    expect(grid.checkBuildability(-1, 0).reason).toBe('OUT_OF_BOUNDS');
    expect(grid.checkBuildability(0, -1).reason).toBe('OUT_OF_BOUNDS');
    expect(grid.checkBuildability(99, 99).reason).toBe('OUT_OF_BOUNDS');

    // Check path cell (entry at col 1, row 6)
    expect(grid.checkBuildability(1, 6).reason).toBe('PATH');

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
  it('should mark path cells properly along the curved trajectory for VASCULAR_RUN', () => {
    const grid = new MapGrid(VASCULAR_RUN_MAP);
    // Entry cell at start (col 1, row 6) should be path
    expect(grid.isPathCell(1, 6)).toBe(true);

    // Far corner cell (0, 0) should be buildable
    expect(grid.isPathCell(0, 0)).toBe(false);
    expect(grid.checkBuildability(0, 0).valid).toBe(true);
    expect(VASCULAR_RUN_MAP.pathGridCells.length).toBeGreaterThan(15);
  });

  it('should correctly mark concentric spiral cells on LYMPH_SPIRAL', () => {
    const lymph = new MapGrid(LYMPH_SPIRAL_MAP);
    expect(lymph.isPathCell(1, 6)).toBe(true);
    // Core center cell (10, 6) is path
    expect(lymph.isPathCell(10, 6)).toBe(true);
    // Non-path terrain cell
    expect(lymph.isPathCell(0, 0)).toBe(false);
    expect(LYMPH_SPIRAL_MAP.pathGridCells.length).toBeGreaterThan(40);
  });

  it('should support multi-axon converging routes on NEURAL_FORK', () => {
    const neural = new MapGrid(NEURAL_FORK_MAP);
    expect(NEURAL_FORK_MAP.routes).toBeDefined();
    expect(NEURAL_FORK_MAP.routes!.length).toBe(3);

    // Mid entry is path
    expect(neural.isPathCell(1, 6)).toBe(true);
    // Unused corner is buildable
    expect(neural.checkBuildability(0, 0).valid).toBe(true);
  });
});
