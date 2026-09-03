import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { GameEngine } from '@/core/engine';
import { TowerTypeId, GridCoord } from '@/core/types';
import { TOWER_DEFINITIONS } from '@/data/towers';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: number;
  size: number;
  alpha: number;
  decay: number;
}

interface FloatingText {
  text: Text;
  x: number;
  y: number;
  vy: number;
  alpha: number;
  lifeMs: number;
}

export class GameRenderer {
  public app: Application;
  private engine: GameEngine;
  private rootContainer: Container;

  private bgLayer: Graphics;
  private pathLayer: Graphics;
  private coreLayer: Graphics;
  private towerLayer: Graphics;
  private enemyLayer: Graphics;
  private projectileLayer: Graphics;
  private effectsLayer: Graphics;
  private previewLayer: Graphics;

  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private pathFlowOffset = 0;
  private pulsePhase = 0;
  private shakeTimeMs = 0;
  private shakeIntensity = 0;

  public activePlacementTower: TowerTypeId | null = null;
  public hoveredCell: GridCoord | null = null;

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.app = new Application();
    this.rootContainer = new Container();

    this.bgLayer = new Graphics();
    this.pathLayer = new Graphics();
    this.coreLayer = new Graphics();
    this.towerLayer = new Graphics();
    this.enemyLayer = new Graphics();
    this.projectileLayer = new Graphics();
    this.effectsLayer = new Graphics();
    this.previewLayer = new Graphics();

    this.rootContainer.addChild(
      this.bgLayer,
      this.pathLayer,
      this.coreLayer,
      this.towerLayer,
      this.enemyLayer,
      this.projectileLayer,
      this.previewLayer,
      this.effectsLayer
    );
  }

  public async init(mountElement: HTMLElement): Promise<void> {
    const width = this.engine.mapGrid.data.cols * this.engine.mapGrid.data.cellSize;
    const height = this.engine.mapGrid.data.rows * this.engine.mapGrid.data.cellSize;

    try {
      await this.app.init({
        width,
        height,
        backgroundColor: 0x050814,
        preference: 'webgl',
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });
      this.app.stage.addChild(this.rootContainer);
      if (this.app.canvas) {
        this.app.canvas.style.maxWidth = '100%';
        this.app.canvas.style.maxHeight = '100%';
        this.app.canvas.style.objectFit = 'contain';
        mountElement.appendChild(this.app.canvas);
      }
    } catch (err) {
      console.warn('WebGL initialization fallback:', err);
    }

    // Subscribe to engine events for visual juice
    this.engine.events.subscribe((event) => {
      if (event.type === 'ENEMY_DEFEATED') {
        this.createShatterParticles(event.position.x, event.position.y, 0x00f5ff, 12);
        this.addFloatingText(`+${event.atpReward} ATP`, event.position.x, event.position.y, '#fbbf24', 13);
      } else if (event.type === 'ENEMY_DAMAGED') {
        if (event.amount >= 30) {
          const enemy = this.engine.enemies.get(event.enemyId);
          if (enemy) {
            this.addFloatingText(`-${event.amount}`, enemy.position.x, enemy.position.y - 12, '#ff3366', 11);
          }
        }
      } else if (event.type === 'CORE_DAMAGED') {
        this.triggerScreenShake(300, 8);
        this.createShatterParticles(
          this.engine.mapGrid.data.corePosition.x,
          this.engine.mapGrid.data.corePosition.y,
          0xff0055,
          25
        );
      } else if (event.type === 'TOWER_PLACED') {
        const world = this.engine.mapGrid.cellToWorld(event.col, event.row);
        this.createShatterParticles(world.x, world.y, 0x00f5ff, 16);
      } else if (event.type === 'PHASE_CHANGED' && event.to === 'PLAYING') {
        // Map may have changed (new game start); redraw is idempotent (clear + draw)
        this.drawStaticBackground();
      }
    });

    this.drawStaticBackground();
  }

  public triggerScreenShake(durationMs: number, intensity: number): void {
    this.shakeTimeMs = durationMs;
    this.shakeIntensity = intensity;
  }

  private createShatterParticles(x: number, y: number, color: number, count = 12): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 120 + 40;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: Math.random() * 3.5 + 1.5,
        alpha: 1,
        decay: Math.random() * 1.5 + 1.5,
      });
    }
  }

  private addFloatingText(msg: string, x: number, y: number, color: string, fontSize = 12): void {
    if (this.floatingTexts.length > 30) return; // Cap floating texts
    const style = new TextStyle({
      fontFamily: 'Share Tech Mono, monospace',
      fontSize,
      fontWeight: 'bold',
      fill: color,
    });
    const text = new Text({ text: msg, style });
    text.anchor.set(0.5);
    text.x = x;
    text.y = y;
    this.rootContainer.addChild(text);

    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -35,
      alpha: 1,
      lifeMs: 800,
    });
  }

  private drawStaticBackground(): void {
    const g = this.bgLayer;
    g.clear();

    const { cols, rows, cellSize, theme, blockedGridCells } = this.engine.mapGrid.data;
    const width = cols * cellSize;
    const height = rows * cellSize;
    const sx = width / 400;
    const sy = height / 300;

    let bgColor = 0x050814;
    let gridColor = 0x0e1638;
    let blockedFill = 0x09102b;
    let blockedStroke = 0x1a2758;
    let padBorder = 0x00f5ff;

    if (theme === 'VASCULAR') {
      bgColor = 0x060f1e;
      gridColor = 0x0d2040;
      blockedFill = 0x0d1f35;
      blockedStroke = 0x7b1010;
      padBorder = 0xc0392b;
    } else if (theme === 'LYMPHATIC') {
      bgColor = 0x050f0c;
      gridColor = 0x0a1f18;
      blockedFill = 0x07201a;
      blockedStroke = 0x0d5c3c;
      padBorder = 0x16a085;
    } else if (theme === 'NEURAL') {
      bgColor = 0x0b0b04;
      gridColor = 0x14120a;
      blockedFill = 0x110f00;
      blockedStroke = 0x4a3800;
      padBorder = 0xd4a017;
    } else if (theme === 'PULMONARY') {
      bgColor = 0x050a18;
      gridColor = 0x080e1f;
      blockedFill = 0x06111e;
      blockedStroke = 0x0d2f4a;
      padBorder = 0x1a6fa0;
    }

    // Grid background
    g.rect(0, 0, width, height);
    g.fill({ color: bgColor });

    // Grid lines
    for (let c = 0; c <= cols; c++) {
      g.moveTo(c * cellSize, 0);
      g.lineTo(c * cellSize, height);
      g.stroke({ width: 1, color: gridColor, alpha: 0.4 });
    }
    for (let r = 0; r <= rows; r++) {
      g.moveTo(0, r * cellSize);
      g.lineTo(width, r * cellSize);
      g.stroke({ width: 1, color: gridColor, alpha: 0.4 });
    }

    // Organic Ambient Decor matching Map Preview
    if (theme === 'VASCULAR') {
      const bloodCells = [
        [80, 100, 8], [200, 180, 6], [310, 130, 7], [150, 220, 5], [340, 200, 9],
        [60, 220, 5], [280, 60, 6], [120, 160, 4], [240, 100, 6], [40, 80, 7],
      ];
      for (const [cx, cy, r] of bloodCells) {
        const x = (cx ?? 0) * sx;
        const y = (cy ?? 0) * sy;
        const rad = (r ?? 6) * sx;
        g.ellipse(x, y, rad, rad * 0.6);
        g.fill({ color: 0xc0392b, alpha: 0.18 });
      }
    } else if (theme === 'LYMPHATIC') {
      const ambientNodes = [
        [60, 60], [340, 70], [350, 230], [50, 240], [200, 50], [200, 265], [120, 150], [280, 160],
      ];
      for (const [x, y] of ambientNodes) {
        g.circle((x ?? 0) * sx, (y ?? 0) * sy, 6 * sx);
        g.fill({ color: 0x1abc9c, alpha: 0.16 });
        g.stroke({ width: 1, color: 0x16a085, alpha: 0.3 });
      }
    } else if (theme === 'NEURAL') {
      const synapses = [
        [60, 100], [60, 150], [60, 200], [205, 130], [355, 90], [355, 175], [110, 80], [300, 210],
      ];
      for (const [x, y] of synapses) {
        const px = (x ?? 0) * sx;
        const py = (y ?? 0) * sy;
        g.circle(px, py, 4 * sx);
        g.fill({ color: 0xf1c40f, alpha: 0.22 });
        g.circle(px, py, 9 * sx);
        g.stroke({ width: 1, color: 0xf1c40f, alpha: 0.18 });
      }
    } else if (theme === 'PULMONARY') {
      const alveoli = [
        [55, 70], [80, 55], [105, 75], [65, 100], [90, 85],
        [55, 215], [80, 230], [105, 215], [65, 195], [90, 205],
        [280, 110], [305, 140], [320, 110], [260, 130], [330, 210], [360, 230],
      ];
      for (const [x, y] of alveoli) {
        g.circle((x ?? 0) * sx, (y ?? 0) * sy, 5 * sx);
        g.fill({ color: 0x00aaff, alpha: 0.15 });
        g.stroke({ width: 1, color: 0x5dade2, alpha: 0.25 });
      }
    }

    // Blocked terrain cells
    for (const blocked of blockedGridCells) {
      const bx = blocked.col * cellSize;
      const by = blocked.row * cellSize;
      g.roundRect(bx + 3, by + 3, cellSize - 6, cellSize - 6, 6);
      g.fill({ color: blockedFill, alpha: 0.95 });
      g.stroke({ width: 1.5, color: blockedStroke });

      // Thematic obstacle deco
      g.circle(bx + cellSize / 2, by + cellSize / 2, 4);
      g.fill({ color: blockedStroke, alpha: 0.5 });
    }

    // Thematic Tower Placement anchor pads
    const themeKey = theme ?? 'VASCULAR';
    const themeTowerPads: Record<string, [number, number][]> = {
      VASCULAR: [[105, 50], [175, 145], [230, 240], [295, 195], [340, 145], [85, 195], [155, 70], [265, 130]],
      LYMPHATIC: [[115, 28], [285, 28], [370, 100], [380, 205], [285, 278], [115, 278], [35, 205], [35, 100], [100, 80], [300, 80]],
      NEURAL: [[55, 30], [55, 278], [180, 70], [180, 195], [325, 45], [325, 220], [230, 100], [230, 165]],
      PULMONARY: [[110, 45], [185, 95], [185, 240], [110, 285], [260, 85], [260, 245], [320, 60], [320, 210]],
    };

    const pads = themeTowerPads[themeKey] || [];
    for (const [px, py] of pads) {
      const x = (px ?? 0) * sx;
      const y = (py ?? 0) * sy;
      g.circle(x, y, 7 * sx);
      g.fill({ color: 0x0d1f35, alpha: 0.6 });
      g.stroke({ width: 1.2, color: padBorder, alpha: 0.5 });
      g.circle(x, y, 3 * sx);
      g.fill({ color: padBorder, alpha: 0.4 });
    }
  }

  public render(dtMs: number): void {
    const dtSec = dtMs / 1000;
    this.pulsePhase += dtSec * 3;
    this.pathFlowOffset = (this.pathFlowOffset + dtSec * 40) % 24;

    // Screen shake update
    if (this.shakeTimeMs > 0) {
      this.shakeTimeMs -= dtMs;
      const ox = (Math.random() * 2 - 1) * this.shakeIntensity;
      const oy = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.rootContainer.x = ox;
      this.rootContainer.y = oy;
    } else {
      this.rootContainer.x = 0;
      this.rootContainer.y = 0;
    }

    this.renderPath();
    this.renderCore();
    this.renderTowers();
    this.renderEnemies();
    this.renderProjectiles();
    this.renderPlacementPreview();
    this.renderEffects(dtSec, dtMs);
  }

  private renderPath(): void {
    const g = this.pathLayer;
    g.clear();

    const { waypoints, routes, cellSize, theme } = this.engine.mapGrid.data;
    const allRoutes = routes && routes.length > 0 ? routes : [waypoints];
    const sx = (this.engine.mapGrid.data.cols * cellSize) / 400;
    const sy = (this.engine.mapGrid.data.rows * cellSize) / 300;

    let glowColor = 0x00f5ff;
    let outerWallColor = 0x7b1010;
    let innerColor = 0xc0392b;
    let conduitColor = 0xff6b6b;
    let nodeGlowColor = 0xff2a2a;

    if (theme === 'VASCULAR') {
      glowColor = 0xff2a2a;
      outerWallColor = 0x7b1010;
      innerColor = 0xc0392b;
      conduitColor = 0xff6b6b;
      nodeGlowColor = 0xe74c3c;
    } else if (theme === 'LYMPHATIC') {
      glowColor = 0x00ff88;
      outerWallColor = 0x0d5c3c;
      innerColor = 0x16a085;
      conduitColor = 0x2ecc71;
      nodeGlowColor = 0x1abc9c;
    } else if (theme === 'NEURAL') {
      glowColor = 0xf1c40f;
      outerWallColor = 0x4a3800;
      innerColor = 0xd4a017;
      conduitColor = 0xffe566;
      nodeGlowColor = 0xf1c40f;
    } else if (theme === 'PULMONARY') {
      glowColor = 0x00aaff;
      outerWallColor = 0x0d2f4a;
      innerColor = 0x1a6fa0;
      conduitColor = 0x5dade2;
      nodeGlowColor = 0x00d4ff;
    }

    for (let rIdx = 0; rIdx < allRoutes.length; rIdx++) {
      const route = allRoutes[rIdx]!;
      if (route.length < 2) continue;

      // 1. Wide Outer Aura Glow
      g.moveTo(route[0]!.x, route[0]!.y);
      for (let i = 1; i < route.length; i++) {
        g.lineTo(route[i]!.x, route[i]!.y);
      }
      g.stroke({
        width: cellSize * 0.7,
        color: glowColor,
        alpha: 0.1,
        cap: 'round',
        join: 'round',
      });

      // 2. Outer Vessel Wall / Sheath
      g.moveTo(route[0]!.x, route[0]!.y);
      for (let i = 1; i < route.length; i++) {
        g.lineTo(route[i]!.x, route[i]!.y);
      }
      g.stroke({
        width: cellSize * 0.42,
        color: outerWallColor,
        alpha: 0.95,
        cap: 'round',
        join: 'round',
      });

      // 3. Primary Vessel Stream Channel
      g.moveTo(route[0]!.x, route[0]!.y);
      for (let i = 1; i < route.length; i++) {
        g.lineTo(route[i]!.x, route[i]!.y);
      }
      g.stroke({
        width: cellSize * 0.28,
        color: innerColor,
        alpha: 0.85,
        cap: 'round',
        join: 'round',
      });

      // 4. Center Bio-Conduit Pulse Line
      const pulseAlpha = 0.5 + Math.sin(this.pulsePhase * 2 + rIdx) * 0.25;
      g.moveTo(route[0]!.x, route[0]!.y);
      for (let i = 1; i < route.length; i++) {
        g.lineTo(route[i]!.x, route[i]!.y);
      }
      g.stroke({
        width: 3.5,
        color: conduitColor,
        alpha: pulseAlpha,
        cap: 'round',
        join: 'round',
      });

      // 5. Flowing Bio-Particles
      const routeLength = this.engine.mapGrid.getRouteLength(rIdx);
      for (let d = this.pathFlowOffset; d < routeLength; d += 24) {
        const pt = this.engine.mapGrid.getPositionAlongPath(d, rIdx);
        g.circle(pt.position.x, pt.position.y, 2.5);
        g.fill({ color: 0xffffff, alpha: 0.7 });
      }

      // 6. Glowing IN Entry Marker at the start of each route
      const startPt = route[0]!;
      const entryPulse = Math.sin(this.pulsePhase * 2) * 3;
      g.circle(startPt.x, startPt.y, 14 + entryPulse);
      g.fill({ color: nodeGlowColor, alpha: 0.25 });
      g.circle(startPt.x, startPt.y, 9);
      g.fill({ color: nodeGlowColor, alpha: 0.9 });
      g.circle(startPt.x, startPt.y, 5);
      g.fill({ color: 0xffffff, alpha: 0.95 });
    }

    // Special Junction / Synapse nodes for Neural & Pulmonary
    if (theme === 'NEURAL') {
      const junctionCoords: [number, number][] = [[150 * sx, 130 * sy], [260 * sx, 130 * sy]];
      for (const [jx, jy] of junctionCoords) {
        g.circle(jx, jy, 16);
        g.fill({ color: 0xf1c40f, alpha: 0.2 });
        g.circle(jx, jy, 9);
        g.fill({ color: 0x4a3800, alpha: 0.95 });
        g.stroke({ width: 2, color: 0xf1c40f });
        g.circle(jx, jy, 4);
        g.fill({ color: 0xffe566, alpha: 0.9 });
      }
    } else if (theme === 'PULMONARY') {
      const junctionCoords: [number, number][] = [[200 * sx, 170 * sy], [340 * sx, 130 * sy]];
      for (const [jx, jy] of junctionCoords) {
        g.circle(jx, jy, 16);
        g.fill({ color: 0x00aaff, alpha: 0.2 });
        g.circle(jx, jy, 9);
        g.fill({ color: 0x0d2f4a, alpha: 0.95 });
        g.stroke({ width: 2, color: 0x5dade2 });
        g.circle(jx, jy, 4);
        g.fill({ color: 0xffffff, alpha: 0.9 });
      }
    }
  }

  private renderCore(): void {
    const g = this.coreLayer;
    g.clear();

    const { corePosition, theme } = this.engine.mapGrid.data;
    const pulse = Math.sin(this.pulsePhase * 2) * 4;
    const integrityRatio = Math.max(0, this.engine.integrity / 100);

    let coreBaseColor = 0x00f5ff;
    if (theme === 'VASCULAR') coreBaseColor = 0xff2a2a;
    else if (theme === 'LYMPHATIC') coreBaseColor = 0x2ecc71;
    else if (theme === 'NEURAL') coreBaseColor = 0xf1c40f;
    else if (theme === 'PULMONARY') coreBaseColor = 0x00d4ff;

    const coreColor = integrityRatio > 0.35 ? coreBaseColor : 0xff0055;

    // Outer pulsating halo
    g.circle(corePosition.x, corePosition.y, 28 + pulse);
    g.fill({ color: coreColor, alpha: 0.25 * integrityRatio + 0.05 });

    // Middle cellular membrane
    g.circle(corePosition.x, corePosition.y, 18);
    g.fill({ color: 0x07162a, alpha: 0.95 });
    g.stroke({ width: 3, color: coreColor, alpha: 0.9 });

    // Inner vital nucleus
    g.circle(corePosition.x, corePosition.y, 9);
    g.fill({ color: coreColor, alpha: 0.85 * integrityRatio + 0.15 });

    // Center core spark
    g.circle(corePosition.x, corePosition.y, 4);
    g.fill({ color: 0xffffff, alpha: 0.95 });
  }

  private renderTowers(): void {
    const g = this.towerLayer;
    g.clear();

    for (const tower of this.engine.towers.values()) {
      const isSelected = this.engine.selectedTowerId === tower.id;
      const x = tower.position.x;
      const y = tower.position.y;
      const colorNum = parseInt(tower.color.replace('#', '0x'), 16);

      // Selected tower range ring
      if (isSelected) {
        g.circle(x, y, tower.range);
        g.fill({ color: colorNum, alpha: 0.08 });
        g.stroke({ width: 1.5, color: colorNum, alpha: 0.6 });
      }

      // Tower base bio-socket & pedestal node
      g.circle(x, y, 20);
      g.fill({ color: 0x050d1a, alpha: 0.95 });
      g.stroke({ width: 2, color: colorNum, alpha: isSelected ? 1 : 0.75 });

      // Outer rotating bio-receptor ring / filopodia
      const rot = this.pulsePhase * 0.8;
      for (let i = 0; i < 6; i++) {
        const a = rot + (i * Math.PI * 2) / 6;
        const flen = 15 + Math.sin(this.pulsePhase * 2 + i) * 2;
        g.circle(x + Math.cos(a) * flen, y + Math.sin(a) * flen, 2);
        g.fill({ color: colorNum, alpha: 0.8 });
      }

      // Realistic Microscopy-inspired Bio-Cellular structures
      if (tower.typeId === 'IGG') {
        // IgG Pulse Sentinel: Cyan dense tangled fiber network + Y-arm emitter
        g.circle(x, y, 13);
        g.fill({ color: 0x00838f, alpha: 0.9 });
        g.stroke({ width: 1.5, color: 0x00e5ff, alpha: 0.85 });

        // Outer dense fibers
        for (let f = 0; f < 8; f++) {
          const fa = (f / 8) * Math.PI * 2 + this.pulsePhase * 0.5;
          g.moveTo(x + Math.cos(fa) * 11, y + Math.sin(fa) * 11);
          g.lineTo(x + Math.cos(fa + 0.3) * 16, y + Math.sin(fa + 0.3) * 16);
          g.stroke({ width: 1.2, color: 0x80deea, alpha: 0.7 });
        }

        // Y-Antibody core emitter
        g.moveTo(x, y + 4);
        g.lineTo(x, y - 2);
        g.stroke({ width: 3, color: 0xb2ebf2, cap: 'round' });
        g.moveTo(x, y - 2);
        g.lineTo(x - 5, y - 7);
        g.stroke({ width: 2.2, color: 0x00e5ff, cap: 'round' });
        g.moveTo(x, y - 2);
        g.lineTo(x + 5, y - 7);
        g.stroke({ width: 2.2, color: 0x00e5ff, cap: 'round' });

        g.circle(x, y - 2, 2.5);
        g.fill({ color: 0xffffff });
      } else if (tower.typeId === 'IGM') {
        // IgM Cluster Cannon: Pentameric 5-lobed macromolecule with satellite plasma nodes
        for (let a = 0; a < 5; a++) {
          const ang = (a * Math.PI * 2) / 5 + this.pulsePhase * 0.6;
          const lx = x + Math.cos(ang) * 8.5;
          const ly = y + Math.sin(ang) * 8.5;
          g.circle(lx, ly, 4.5);
          g.fill({ color: 0xad1457, alpha: 0.9 });
          g.stroke({ width: 1, color: 0xf48fb1, alpha: 0.8 });
          g.circle(lx - 1, ly - 1, 1.5);
          g.fill({ color: 0xffffff, alpha: 0.6 });
        }
        g.circle(x, y, 5);
        g.fill({ color: 0xfce4ec });
        g.stroke({ width: 1.5, color: 0xe040fb });
      } else if (tower.typeId === 'IGA') {
        // IgA Cryo-Tether: Dense green fibrous cell with crystalline freeze spikes
        g.circle(x, y, 12);
        g.fill({ color: 0x1b5e20, alpha: 0.95 });
        g.stroke({ width: 1.5, color: 0x76ff03, alpha: 0.9 });

        // Crystalline ice spikes
        for (let c = 0; c < 6; c++) {
          const ca = (c / 6) * Math.PI * 2 + this.pulsePhase * 0.3;
          const tipX = x + Math.cos(ca) * 16;
          const tipY = y + Math.sin(ca) * 16;
          g.poly([
            x + Math.cos(ca - 0.2) * 10,
            y + Math.sin(ca - 0.2) * 10,
            tipX,
            tipY,
            x + Math.cos(ca + 0.2) * 10,
            y + Math.sin(ca + 0.2) * 10,
          ]);
          g.fill({ color: 0xe8ffe0, alpha: 0.85 });
        }
        g.circle(x, y, 4);
        g.fill({ color: 0xffffff });
      } else if (tower.typeId === 'KILLER_T') {
        // Killer T-Cell: Amber/gold dense cylindrical microvilli crown + blue cytotoxic cytoplasm
        g.circle(x, y, 13);
        g.fill({ color: 0xbf360c, alpha: 0.95 });
        g.stroke({ width: 1.5, color: 0xffd54f, alpha: 0.9 });

        // Dense radial microvilli
        for (let m = 0; m < 12; m++) {
          const ma = (m / 12) * Math.PI * 2 + this.pulsePhase * 0.4;
          g.moveTo(x + Math.cos(ma) * 11, y + Math.sin(ma) * 11);
          g.lineTo(x + Math.cos(ma) * 17, y + Math.sin(ma) * 17);
          g.stroke({ width: 2.2, color: 0xffd54f, cap: 'round' });
        }

        // Visible blue cytoplasm interior (reference microscopy)
        g.circle(x, y, 7);
        g.fill({ color: 0x0288d1, alpha: 0.9 });
        g.circle(x, y, 3.5);
        g.fill({ color: 0xffffff });
      }

      // Upgrade tier level pips
      for (let lvl = 1; lvl < tower.level; lvl++) {
        g.circle(x - 8 + (lvl - 1) * 7, y + 15, 2.5);
        g.fill({ color: 0xfbbf24 });
      }
    }
  }

  private renderEnemies(): void {
    const g = this.enemyLayer;
    g.clear();

    for (const enemy of this.engine.enemies.values()) {
      if (enemy.isDead || enemy.isLeaked) continue;

      const x = enemy.position.x;
      const y = enemy.position.y;
      const colorNum = parseInt(enemy.color.replace('#', '0x'), 16);
      const isSlowed = enemy.statusEffects.some((s) => s.type === 'SLOW');

      // Soft cellular outer membrane
      const pulse = Math.sin(this.pulsePhase * 4 + enemy.distanceTravelled) * 1.5;
      const radius = enemy.size / 2 + pulse;

      g.circle(x, y, radius);
      g.fill({ color: colorNum, alpha: 0.88 });
      g.stroke({
        width: 1.5,
        color: isSlowed ? 0x10b981 : 0xffffff,
        alpha: 0.75,
      });

      // Spikes and unique realistic morphology per enemy type
      if (enemy.typeId === 'RHINOVIRUS') {
        // Acute Pathogen / Rhinovirus: Spiky icosahedral vertices + surface fibrils
        for (let s = 0; s < 6; s++) {
          const ang = (s * Math.PI * 2) / 6 + this.pulsePhase * 2;
          const sx = x + Math.cos(ang) * (radius + 4);
          const sy = y + Math.sin(ang) * (radius + 4);
          g.moveTo(x + Math.cos(ang) * (radius - 2), y + Math.sin(ang) * (radius - 2));
          g.lineTo(sx, sy);
          g.stroke({ width: 1.5, color: 0xffccbc, alpha: 0.85 });
          g.circle(sx, sy, 1.2);
          g.fill({ color: 0xffffff });
        }
      } else if (enemy.typeId === 'INFLUENZA') {
        // Viral Agent / Influenza: Coronavirus-style spike proteins with bulbous tips
        for (let s = 0; s < 8; s++) {
          const ang = (s * Math.PI * 2) / 8 + this.pulsePhase;
          const sx = x + Math.cos(ang) * (radius + 4);
          const sy = y + Math.sin(ang) * (radius + 4);
          g.moveTo(x + Math.cos(ang) * radius, y + Math.sin(ang) * radius);
          g.lineTo(sx, sy);
          g.stroke({ width: 1.8, color: 0xff5722, cap: 'round' });
          g.circle(sx, sy, 2.5);
          g.fill({ color: 0xffab40 });
        }
      } else if (enemy.typeId === 'CORONA_TITAN') {
        // Armored Virus / Corona Titan: Hexagonal armored carapace plates + capsid
        for (let i = 0; i < 6; i++) {
          const ang = (i * Math.PI * 2) / 6 + this.pulsePhase * 0.8;
          g.roundRect(x + Math.cos(ang) * 14 - 3.5, y + Math.sin(ang) * 14 - 3.5, 7, 7, 2);
          g.fill({ color: 0xf1f5f9, alpha: 0.95 });
          g.stroke({ width: 1.2, color: 0x990033 });
        }
      } else if (enemy.typeId === 'RETRO_MUTANT') {
        // Cytokine Storm / Retro-Mutant Boss: Massive multi-nucleated envelope with orbiting satellite virions
        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI * 2) / 8 + this.pulsePhase * 1.5;
          g.circle(x + Math.cos(ang) * 12, y + Math.sin(ang) * 12, 5);
          g.fill({ color: 0xff0055, alpha: 0.9 });
          g.circle(x + Math.cos(ang) * 12, y + Math.sin(ang) * 12, 2);
          g.fill({ color: 0xffffff });
        }
        // Danger bio-aura ring
        g.circle(x, y, radius + 8);
        g.stroke({ width: 2, color: 0xff0055, alpha: 0.4 + Math.sin(this.pulsePhase * 3) * 0.3 });
      }

      // Inner dense genetic core
      g.circle(x, y, radius * 0.45);
      g.fill({ color: 0xffffff, alpha: 0.75 });

      // Health bar above enemy
      const barW = Math.max(22, enemy.size + 6);
      const barH = 3.5;
      const barY = y - radius - 8;
      const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

      g.rect(x - barW / 2, barY, barW, barH);
      g.fill({ color: 0x000000, alpha: 0.65 });

      g.rect(x - barW / 2, barY, barW * hpRatio, barH);
      g.fill({ color: hpRatio > 0.4 ? 0x10b981 : 0xff0055 });
    }
  }

  private renderProjectiles(): void {
    const g = this.projectileLayer;
    g.clear();

    // Render active laser beams from Killer T & IgA tethers
    for (const tower of this.engine.towers.values()) {
      if (tower.targetId) {
        const target = this.engine.enemies.get(tower.targetId);
        if (target && !target.isDead && !target.isLeaked) {
          if (tower.typeId === 'KILLER_T') {
            // Thermal laser beam
            const lockSec = Math.min(3, (tower.beamLockDurationMs || 0) / 1000);
            const beamWidth = 2 + lockSec * 2;
            g.moveTo(tower.position.x, tower.position.y);
            g.lineTo(target.position.x, target.position.y);
            g.stroke({ width: beamWidth, color: 0xfbbf24, alpha: 0.85 });
          } else if (tower.typeId === 'IGA') {
            // Cryo tether beam
            g.moveTo(tower.position.x, tower.position.y);
            g.lineTo(target.position.x, target.position.y);
            g.stroke({ width: 2.5, color: 0x10b981, alpha: 0.75 });
          }
        }
      }
    }

    // Render flying projectiles
    for (const proj of this.engine.projectiles) {
      if (proj.isDead) continue;
      const colorNum = parseInt(proj.color.replace('#', '0x'), 16);

      if (proj.specialType === 'CLUSTER') {
        // IgM plasma cluster bomb
        g.circle(proj.currentPosition.x, proj.currentPosition.y, 5);
        g.fill({ color: colorNum });
        g.circle(proj.currentPosition.x, proj.currentPosition.y, 8);
        g.fill({ color: colorNum, alpha: 0.3 });
      } else {
        // IgG photon pulse
        g.circle(proj.currentPosition.x, proj.currentPosition.y, 3.5);
        g.fill({ color: 0xffffff });
        g.circle(proj.currentPosition.x, proj.currentPosition.y, 6);
        g.fill({ color: colorNum, alpha: 0.5 });
      }
    }
  }

  private renderPlacementPreview(): void {
    const g = this.previewLayer;
    g.clear();

    if (!this.activePlacementTower || !this.hoveredCell) return;

    const def = TOWER_DEFINITIONS[this.activePlacementTower];
    if (!def) return;

    const check = this.engine.checkPlacement(
      this.hoveredCell.col,
      this.hoveredCell.row,
      def.cost
    );
    const world = this.engine.mapGrid.cellToWorld(this.hoveredCell.col, this.hoveredCell.row);
    const color = check.valid ? 0x00f5ff : 0xff0055;

    // Range preview circle
    g.circle(world.x, world.y, def.range);
    g.fill({ color, alpha: 0.08 });
    g.stroke({ width: 1.5, color, alpha: 0.5 });

    // Cell highlight box
    const cs = this.engine.mapGrid.data.cellSize;
    const bx = this.hoveredCell.col * cs;
    const by = this.hoveredCell.row * cs;
    g.roundRect(bx + 2, by + 2, cs - 4, cs - 4, 6);
    g.fill({ color, alpha: 0.2 });
    g.stroke({ width: 2, color, alpha: 0.8 });
  }

  private renderEffects(dtSec: number, dtMs: number): void {
    const g = this.effectsLayer;
    g.clear();

    // Update & draw particles
    const survivingParticles: Particle[] = [];
    for (const p of this.particles) {
      p.x += p.vx * dtSec;
      p.y += p.vy * dtSec;
      p.alpha -= p.decay * dtSec;

      if (p.alpha > 0) {
        g.circle(p.x, p.y, p.size);
        g.fill({ color: p.color, alpha: p.alpha });
        survivingParticles.push(p);
      }
    }
    this.particles = survivingParticles;

    // Update & draw floating text
    const survivingTexts: FloatingText[] = [];
    for (const ft of this.floatingTexts) {
      ft.lifeMs -= dtMs;
      ft.y += ft.vy * dtSec;
      ft.text.y = ft.y;
      ft.alpha = Math.max(0, ft.lifeMs / 800);
      ft.text.alpha = ft.alpha;

      if (ft.lifeMs > 0) {
        survivingTexts.push(ft);
      } else {
        this.rootContainer.removeChild(ft.text);
        ft.text.destroy();
      }
    }
    this.floatingTexts = survivingTexts;
  }
}
