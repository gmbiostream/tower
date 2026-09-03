import {
  MapData,
  GridCoord,
  WorldCoord,
  BuildabilityCheckResult,
} from './types';

export interface PathSegment {
  start: WorldCoord;
  end: WorldCoord;
  length: number;
  cumulativeStartDistance: number;
  cumulativeEndDistance: number;
}

export class MapGrid {
  public readonly data: MapData;
  public readonly segments: PathSegment[];
  public readonly totalPathLength: number;
  private readonly pathCellSet: Set<string>;
  private readonly blockedCellSet: Set<string>;

  constructor(data: MapData) {
    this.data = data;
    this.pathCellSet = new Set(data.pathGridCells.map((c) => `${c.col},${c.row}`));
    this.blockedCellSet = new Set(data.blockedGridCells.map((c) => `${c.col},${c.row}`));

    // Compute path segments and lengths
    this.segments = [];
    let currentDist = 0;

    for (let i = 0; i < data.waypoints.length - 1; i++) {
      const start = data.waypoints[i]!;
      const end = data.waypoints[i + 1]!;
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const length = Math.hypot(dx, dy);

      this.segments.push({
        start,
        end,
        length,
        cumulativeStartDistance: currentDist,
        cumulativeEndDistance: currentDist + length,
      });

      currentDist += length;
    }

    this.totalPathLength = currentDist;
  }

  public cellToWorld(col: number, row: number): WorldCoord {
    return {
      x: (col + 0.5) * this.data.cellSize,
      y: (row + 0.5) * this.data.cellSize,
    };
  }

  public worldToCell(x: number, y: number): GridCoord {
    return {
      col: Math.floor(x / this.data.cellSize),
      row: Math.floor(y / this.data.cellSize),
    };
  }

  public isInBounds(col: number, row: number): boolean {
    return col >= 0 && col < this.data.cols && row >= 0 && row < this.data.rows;
  }

  public isPathCell(col: number, row: number): boolean {
    return this.pathCellSet.has(`${col},${row}`);
  }

  public isBlockedCell(col: number, row: number): boolean {
    return this.blockedCellSet.has(`${col},${row}`);
  }

  public checkBuildability(
    col: number,
    row: number,
    occupiedSet: Set<string> = new Set()
  ): BuildabilityCheckResult {
    const coord: GridCoord = { col, row };

    if (!this.isInBounds(col, row)) {
      return { valid: false, reason: 'OUT_OF_BOUNDS', coord };
    }
    if (this.isPathCell(col, row)) {
      return { valid: false, reason: 'PATH', coord };
    }
    if (this.isBlockedCell(col, row)) {
      return { valid: false, reason: 'BLOCKED', coord };
    }
    if (occupiedSet.has(`${col},${row}`)) {
      return { valid: false, reason: 'OCCUPIED', coord };
    }

    return { valid: true, reason: 'VALID', coord };
  }

  /**
   * Evaluates world coordinates and progress ratio along the path given distance.
   */
  public getPositionAlongPath(distance: number): {
    position: WorldCoord;
    progress: number;
    completed: boolean;
    tangentAngle: number;
  } {
    if (this.totalPathLength <= 0 || this.segments.length === 0) {
      const fallback = this.data.entryPosition;
      return { position: fallback, progress: 0, completed: false, tangentAngle: 0 };
    }

    if (distance >= this.totalPathLength) {
      const lastSeg = this.segments[this.segments.length - 1]!;
      const dx = lastSeg.end.x - lastSeg.start.x;
      const dy = lastSeg.end.y - lastSeg.start.y;
      return {
        position: lastSeg.end,
        progress: 1,
        completed: true,
        tangentAngle: Math.atan2(dy, dx),
      };
    }

    if (distance <= 0) {
      const firstSeg = this.segments[0]!;
      const dx = firstSeg.end.x - firstSeg.start.x;
      const dy = firstSeg.end.y - firstSeg.start.y;
      return {
        position: firstSeg.start,
        progress: 0,
        completed: false,
        tangentAngle: Math.atan2(dy, dx),
      };
    }

    // Find the active segment
    for (const seg of this.segments) {
      if (distance <= seg.cumulativeEndDistance) {
        const segDist = distance - seg.cumulativeStartDistance;
        const t = seg.length > 0 ? segDist / seg.length : 0;
        const x = seg.start.x + (seg.end.x - seg.start.x) * t;
        const y = seg.start.y + (seg.end.y - seg.start.y) * t;
        const dx = seg.end.x - seg.start.x;
        const dy = seg.end.y - seg.start.y;

        return {
          position: { x, y },
          progress: distance / this.totalPathLength,
          completed: false,
          tangentAngle: Math.atan2(dy, dx),
        };
      }
    }

    const lastSeg = this.segments[this.segments.length - 1]!;
    return {
      position: lastSeg.end,
      progress: 1,
      completed: true,
      tangentAngle: 0,
    };
  }
}
