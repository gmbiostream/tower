import { Application, Container, Graphics, Text, TextStyle, Assets, Texture, Sprite } from 'pixi.js';
import { GameEngine } from '@/core/engine';
import { TowerTypeId, GridCoord, EnemyInstance, TowerInstance } from '@/core/types';
import { TOWER_DEFINITIONS } from '@/data/towers';
import { ENEMY_PALETTES } from '@/ui/towerSprites';

function hex(color: string): number {
  return parseInt(color.replace('#', '0x'), 16);
}

/** Tangled curved fibers around a cell (mirrors makeFibers in the SVG sprites). */
function drawFibers(
  g: Graphics,
  x: number,
  y: number,
  baseR: number,
  count: number,
  minLen: number,
  maxLen: number,
  curliness: number,
  color: number,
  alpha: number,
  phase: number,
  width = 1
): void {
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + phase * 0.3 + Math.sin(i * 1.618) * 0.28;
    const len = minLen + Math.abs(Math.sin(i * 2.1 + 0.5 + phase * 0.5)) * (maxLen - minLen);
    const curl = Math.sin(i * 4.1 + 0.7 + phase) * curliness;
    g.moveTo(x + Math.cos(a) * baseR, y + Math.sin(a) * baseR);
    g.quadraticCurveTo(
      x + Math.cos(a + curl * 0.5) * (baseR + len * 0.58),
      y + Math.sin(a + curl * 0.5) * (baseR + len * 0.58),
      x + Math.cos(a + curl) * (baseR + len),
      y + Math.sin(a + curl) * (baseR + len)
    );
    g.stroke({ width, color, alpha: alpha * (0.5 + Math.abs(Math.sin(i * 2.9)) * 0.5), cap: 'round' });
  }
}

/** Organic blob outline (mirrors smoothBlob). */
function blobPoints(x: number, y: number, radius: number, phase: number, n = 18, wobble = 0.1): number[] {
  const points: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = radius * (1 + Math.sin(i * 2.1 + phase) * wobble + Math.sin(i * 4.7) * wobble * 0.5);
    points.push(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  return points;
}

/** Long curving pseudopod arms (mirrors pseudopod). */
function drawPseudopods(
  g: Graphics,
  x: number,
  y: number,
  startR: number,
  count: number,
  length: number,
  color: number,
  alpha: number,
  phase: number,
  width = 1.5
): void {
  for (let i = 0; i < count; i++) {
    const a = phase * 0.2 + (i / count) * Math.PI * 2 + i * 0.4;
    const curl = (i % 2 === 0 ? 0.45 : -0.35) + Math.sin(phase + i) * 0.15;
    const len = length * (0.75 + Math.abs(Math.sin(i * 1.7 + phase * 0.6)) * 0.5);
    g.moveTo(x + Math.cos(a) * startR, y + Math.sin(a) * startR);
    g.bezierCurveTo(
      x + Math.cos(a + curl * 0.3) * (startR + len * 0.35),
      y + Math.sin(a + curl * 0.3) * (startR + len * 0.35),
      x + Math.cos(a + curl * 0.7) * (startR + len * 0.7),
      y + Math.sin(a + curl * 0.7) * (startR + len * 0.7),
      x + Math.cos(a + curl) * (startR + len),
      y + Math.sin(a + curl) * (startR + len)
    );
    g.stroke({ width, color, alpha, cap: 'round' });
  }
}

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
  private towerSpriteContainer: Container;
  private enemyLayer: Graphics;
  private enemySpriteContainer: Container;
  private projectileLayer: Graphics;
  private effectsLayer: Graphics;
  private previewLayer: Graphics;

  private textures: Map<string, Texture> = new Map();
  private towerSprites: Map<string, Sprite> = new Map();
  private enemySprites: Map<string, Sprite> = new Map();

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
    this.towerSpriteContainer = new Container();
    this.enemyLayer = new Graphics();
    this.enemySpriteContainer = new Container();
    this.projectileLayer = new Graphics();
    this.effectsLayer = new Graphics();
    this.previewLayer = new Graphics();

    this.rootContainer.addChild(
      this.bgLayer,
      this.pathLayer,
      this.coreLayer,
      this.towerLayer,
      this.towerSpriteContainer,
      this.enemyLayer,
      this.enemySpriteContainer,
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

      await this.loadSpriteTextures();
    } catch (err) {
      console.warn('WebGL initialization fallback:', err);
    }

    // Subscribe to engine events for visual juice
    this.engine.events.subscribe((event) => {
      if (event.type === 'ENEMY_DEFEATED') {
        this.createShatterParticles(event.position.x, event.position.y, 0x00f5ff, 12);
        this.addFloatingText(`+${event.atpReward} ATP`, event.position.x, event.position.y, '#fbbf24', 13);
      } else if (event.type === 'ENEMY_DAMAGED') {
        if (event.immune) {
          const enemy = this.engine.enemies.get(event.enemyId);
          if (enemy && Math.random() < 0.15) {
            this.addFloatingText('IMMUNE', enemy.position.x, enemy.position.y - 14, '#eceff1', 10);
          }
        } else if (event.amount >= 30) {
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

  private async loadSpriteTextures(): Promise<void> {
    const assetsToLoad: Record<string, string> = {
      // Enemies
      'enemy_RHINOVIRUS': '/sprites/acute_pathogen.png',
      'enemy_INFLUENZA': '/sprites/viral_agent.png',
      'enemy_CORONA_TITAN': '/sprites/armored_virus.png',
      'enemy_RETRO_MUTANT': '/sprites/cytokine_storm.png',
      'enemy_HEATSHOCK_CARRIER': '/sprites/armored_virus.png',

      // Towers Base
      'tower_IGG': '/sprites/igg_pulse.png',
      'tower_IGA': '/sprites/iga_cryo-tether.png',
      'tower_IGM': '/sprites/igm_cluster.png',
      'tower_KILLER_T': '/sprites/killer_t-cell.png',
      'tower_MACROPHAGE': '/sprites/macrophage.png',

      // Tower Upgrades / Branches
      'upgrade_HYPERPULSE_BARRAGE': '/sprites/hyperpulse_barrage.png',
      'upgrade_ANTIBODY_STORM': '/sprites/antibody_storm.png',
      'upgrade_DEEP_FREEZE': '/sprites/deep_freeze.png',
      'upgrade_GLACIAL_AURA': '/sprites/glacial_aura.png',
      'upgrade_TOXIN_NEBULA': '/sprites/toxin_nebula.png',
      'upgrade_CHAIN_REACTION': '/sprites/chain_reaction.png',
      'upgrade_PERFORIN_LANCE': '/sprites/killer_t-cell.png',
      'upgrade_CYTOTOXIC_NOVA': '/sprites/cytotoxic_nova.png',
    };

    for (const [key, path] of Object.entries(assetsToLoad)) {
      try {
        const tex = await Assets.load(path);
        if (tex) {
          this.textures.set(key, tex);
        }
      } catch (err) {
        console.warn(`Could not load sprite texture for ${key} at ${path}:`, err);
      }
    }
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
      // Soft membrane aura makes each placement read as a living circular
      // socket rather than a square tile.
      g.circle(x, y, 25 + Math.sin(this.pulsePhase * 2 + x) * 2);
      g.fill({ color: colorNum, alpha: 0.06 });
      g.stroke({ width: 1, color: colorNum, alpha: 0.25 });
      g.circle(x, y, 20);
      g.fill({ color: 0x050d1a, alpha: 0.95 });
      g.stroke({ width: 2, color: colorNum, alpha: isSelected ? 1 : 0.75 });

      const ph = this.pulsePhase;
      const firing = tower.cooldownMs > tower.fireIntervalMs * 0.7;
      const recoil = firing ? 1.5 : 0;

      // Bio-cellular bodies mirroring the field-manual sprites
      if (tower.typeId === 'IGG') {
        // IgG Pulse Sentinel: cyan tangled fibril mesh, 3 pseudopods, Y-antibody emitter
        drawPseudopods(g, x, y, 12, 3, 9, 0x00bcd4, 0.6, ph, 1.2);
        drawFibers(g, x, y, 12, 18, 2, 6, 0.5, 0x00e5ff, 0.55, ph, 1);
        g.circle(x, y, 12);
        g.fill({ color: 0x00838f, alpha: 0.95 });
        g.stroke({ width: 1.5, color: 0x80deea, alpha: 0.9 });
        g.circle(x + 1, y + 1, 5.5);
        g.fill({ color: 0x0097a7, alpha: 0.9 });

        // Y-Antibody emitter pointing at the target (or up when idle)
        const target = tower.targetId ? this.engine.enemies.get(tower.targetId) : undefined;
        const aim = target ? Math.atan2(target.position.y - y, target.position.x - x) : -Math.PI / 2;
        const stemLen = 5 + recoil;
        const hx = x + Math.cos(aim) * stemLen;
        const hy = y + Math.sin(aim) * stemLen;
        g.moveTo(x - Math.cos(aim) * 4, y - Math.sin(aim) * 4);
        g.lineTo(hx, hy);
        g.stroke({ width: 3, color: 0xb2ebf2, cap: 'round' });
        for (const side of [-0.65, 0.65]) {
          g.moveTo(hx, hy);
          g.lineTo(hx + Math.cos(aim + side) * 6, hy + Math.sin(aim + side) * 6);
          g.stroke({ width: 2.2, color: 0x00e5ff, cap: 'round' });
          g.circle(hx + Math.cos(aim + side) * 6, hy + Math.sin(aim + side) * 6, 1.4);
          g.fill({ color: 0xffffff });
        }
        g.circle(hx, hy, 2.2);
        g.fill({ color: 0xffffff });
      } else if (tower.typeId === 'IGM') {
        // IgM Cluster Cannon: pentameric 5-lobed macromolecule joined by a J-chain
        const lobeR = 8.5 + (firing ? 1.5 : 0);
        for (let a = 0; a < 5; a++) {
          const ang = (a * Math.PI * 2) / 5 + ph * 0.6;
          const nx = (((a + 1) % 5) * Math.PI * 2) / 5 + ph * 0.6;
          g.moveTo(x + Math.cos(ang) * lobeR, y + Math.sin(ang) * lobeR);
          g.lineTo(x + Math.cos(nx) * lobeR, y + Math.sin(nx) * lobeR);
          g.stroke({ width: 2.5, color: 0x880e4f, alpha: 0.7 });
          g.moveTo(x, y);
          g.lineTo(x + Math.cos(ang) * lobeR, y + Math.sin(ang) * lobeR);
          g.stroke({ width: 2, color: 0x880e4f, alpha: 0.6 });
        }
        for (let a = 0; a < 5; a++) {
          const ang = (a * Math.PI * 2) / 5 + ph * 0.6;
          const lx = x + Math.cos(ang) * lobeR;
          const ly = y + Math.sin(ang) * lobeR;
          g.circle(lx, ly, 4.8);
          g.fill({ color: 0xad1457, alpha: 0.95 });
          g.stroke({ width: 1, color: 0xf48fb1, alpha: 0.85 });
          g.circle(lx - 1.2, ly - 1.2, 1.5);
          g.fill({ color: 0xffffff, alpha: 0.6 });
        }
        g.circle(x, y, 4.5);
        g.fill({ color: 0xf8bbd0 });
        g.stroke({ width: 1.5, color: 0xc2185b });
        g.circle(x, y, 1.8);
        g.fill({ color: 0xffffff });
      } else if (tower.typeId === 'IGA') {
        // IgA Cryo-Tether: dense green fibrous cell, crystalline spikes, dimeric secretory link
        drawFibers(g, x, y, 11, 16, 2, 5, 0.5, 0xb9f6ca, 0.5, ph, 1);
        for (let c = 0; c < 10; c++) {
          const ca = (c / 10) * Math.PI * 2 + ph * 0.25;
          const tipR = 15 + Math.sin(c * 2.8 + ph) * 2;
          g.poly([
            x + Math.cos(ca - 0.16) * 10,
            y + Math.sin(ca - 0.16) * 10,
            x + Math.cos(ca) * tipR,
            y + Math.sin(ca) * tipR,
            x + Math.cos(ca + 0.16) * 10,
            y + Math.sin(ca + 0.16) * 10,
          ]);
          g.fill({ color: 0xe8ffe0, alpha: 0.85 });
          g.stroke({ width: 0.6, color: 0x2e7d32, alpha: 0.8 });
        }
        g.circle(x, y, 11);
        g.fill({ color: 0x1b5e20, alpha: 0.95 });
        g.stroke({ width: 1.5, color: 0xb9f6ca, alpha: 0.9 });
        g.ellipse(x - 4.5, y, 3.2, 2.3);
        g.fill({ color: 0x33691e });
        g.stroke({ width: 0.8, color: 0xccff90 });
        g.ellipse(x + 4.5, y, 3.2, 2.3);
        g.fill({ color: 0x33691e });
        g.stroke({ width: 0.8, color: 0xccff90 });
        g.roundRect(x - 2.5, y - 2.5, 5, 5, 1.2);
        g.fill({ color: 0x76ff03 });
        g.stroke({ width: 0.8, color: 0xffffff });
      } else if (tower.typeId === 'KILLER_T') {
        // Killer T-Cell Prism: amber microvilli crown, blue cytotoxic cytoplasm, prism core
        for (let m = 0; m < 18; m++) {
          const ma = (m / 18) * Math.PI * 2 + ph * 0.4;
          const outer = 16.5 + Math.sin(m * 3.1 + ph * 2) * 1.5;
          g.moveTo(x + Math.cos(ma) * 12, y + Math.sin(ma) * 12);
          g.lineTo(x + Math.cos(ma) * outer, y + Math.sin(ma) * outer);
          g.stroke({ width: 2, color: 0xffd54f, cap: 'round' });
          g.circle(x + Math.cos(ma) * outer, y + Math.sin(ma) * outer, 0.9);
          g.fill({ color: 0xfff8e1 });
        }
        g.circle(x, y, 12.5);
        g.fill({ color: 0xbf360c, alpha: 0.95 });
        g.stroke({ width: 1.5, color: 0xffd54f, alpha: 0.9 });
        g.circle(x, y, 7);
        g.fill({ color: 0x0288d1, alpha: 0.85 });
        const lock = Math.min(1, (tower.beamLockDurationMs || 0) / 3000);
        g.poly([x, y - 5.5 - lock * 1.5, x + 5, y + 3.5, x - 5, y + 3.5]);
        g.fill({ color: 0xfff9c4, alpha: 0.95 });
        g.stroke({ width: 1, color: 0xbf360c });
        g.circle(x, y + 1, 2 + lock);
        g.fill({ color: 0x00e5ff });
      } else if (tower.typeId === 'MACROPHAGE') {
        // Macrophage Engulfer: violet amoeboid blob with reaching pseudopods and lysosome granules
        drawPseudopods(g, x, y, 11, 5, 9 + recoil * 2, 0xa78bfa, 0.75, ph, 2.4);
        drawFibers(g, x, y, 11, 14, 2, 5, 0.6, 0xc4b5fd, 0.45, ph, 0.9);
        g.poly(blobPoints(x, y, 12.5 + recoil, ph * 0.8, 16, 0.12));
        g.fill({ color: 0x5b21b6, alpha: 0.95 });
        g.stroke({ width: 1.4, color: 0xc4b5fd, alpha: 0.9 });
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + 0.4 + ph * 0.2;
          const r = 5.5 + Math.sin(i * 2.3) * 1.5;
          g.circle(x + Math.cos(a) * r, y + Math.sin(a) * r, 1.6 + Math.abs(Math.sin(i * 1.7)) * 0.8);
          g.fill({ color: 0xede9fe, alpha: 0.9 });
        }
        g.circle(x - 1, y + 1, 4);
        g.fill({ color: 0xa78bfa, alpha: 0.95 });
        g.circle(x - 2.2, y - 0.2, 1.4);
        g.fill({ color: 0xffffff, alpha: 0.7 });
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
      const isSlowed = enemy.statusEffects.some((s) => s.type === 'SLOW');
      const isBrittle = enemy.statusEffects.some((s) => s.type === 'BRITTLE');
      const isBurning = enemy.statusEffects.some((s) => s.type === 'DOT');

      const ph = this.pulsePhase + enemy.distanceTravelled * 0.02;
      const pulse = Math.sin(this.pulsePhase * 4 + enemy.distanceTravelled) * 1.2;
      const radius = enemy.size / 2 + pulse;

      this.drawEnemyBody(g, enemy, x, y, radius, ph);

      // Status overlays
      if (isSlowed) {
        g.circle(x, y, radius + 3);
        g.stroke({ width: 1.5, color: 0x67e8f9, alpha: 0.7 });
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2 + this.pulsePhase;
          g.poly([
            x + Math.cos(a) * (radius + 2), y + Math.sin(a) * (radius + 2),
            x + Math.cos(a - 0.2) * (radius + 6), y + Math.sin(a - 0.2) * (radius + 6),
            x + Math.cos(a + 0.2) * (radius + 6), y + Math.sin(a + 0.2) * (radius + 6),
          ]);
          g.fill({ color: 0xe0ffff, alpha: 0.8 });
        }
      }
      if (isBrittle) {
        g.circle(x, y, radius + 1);
        g.stroke({ width: 1, color: 0xc4b5fd, alpha: 0.8 });
      }
      if (isBurning) {
        for (let i = 0; i < 3; i++) {
          const a = this.pulsePhase * 3 + (i / 3) * Math.PI * 2;
          g.circle(x + Math.cos(a) * radius * 0.8, y + Math.sin(a) * radius * 0.8, 1.8);
          g.fill({ color: 0xa3e635, alpha: 0.85 });
        }
      }

      // Health bar above enemy
      const barW = Math.max(22, enemy.size + 6);
      const barH = 3.5;
      const barY = y - radius - 10;
      const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

      g.rect(x - barW / 2, barY, barW, barH);
      g.fill({ color: 0x000000, alpha: 0.65 });

      g.rect(x - barW / 2, barY, barW * hpRatio, barH);
      g.fill({ color: hpRatio > 0.4 ? 0x10b981 : 0xff0055 });

      // Immunity shield pip
      if (enemy.immunities.length > 0) {
        g.circle(x + barW / 2 + 4, barY + barH / 2, 2.8);
        g.fill({ color: 0xeceff1, alpha: 0.95 });
        g.stroke({ width: 0.8, color: 0xef5350 });
      }
    }
  }

  /** Per-type organic body mirroring the field-manual sprite designs. */
  private drawEnemyBody(g: Graphics, enemy: EnemyInstance, x: number, y: number, radius: number, ph: number): void {
    const pal = ENEMY_PALETTES[enemy.typeId] ?? ENEMY_PALETTES.INFLUENZA!;
    const base = hex(pal.base);
    const light = hex(pal.light);
    const dark = hex(pal.dark);
    const accent = hex(pal.accent);

    if (enemy.typeId === 'RHINOVIRUS') {
      // Acute Pathogen: pink tangled fibrous amoeba with long trailing pseudopods
      drawPseudopods(g, x, y, radius, 5, radius * 1.6, light, 0.5, ph, 1);
      drawFibers(g, x, y, radius - 1, 22, 2, radius * 0.7, 0.68, light, 0.55, ph, 0.9);
      g.poly(blobPoints(x, y, radius, ph, 14, 0.16));
      g.fill({ color: base, alpha: 0.95 });
      g.stroke({ width: 1, color: light, alpha: 0.8 });
      g.circle(x + 1, y + 1.5, radius * 0.4);
      g.fill({ color: dark, alpha: 0.8 });
      g.circle(x, y + 1, radius * 0.22);
      g.fill({ color: accent, alpha: 0.7 });
    } else if (enemy.typeId === 'INFLUENZA') {
      // Viral Agent: orange coronavirus with bulbous spike proteins
      drawPseudopods(g, x, y, radius, 4, radius * 1.1, accent, 0.45, ph, 1);
      drawFibers(g, x, y, radius - 1, 14, 1.5, radius * 0.45, 0.5, light, 0.45, ph, 0.8);
      for (let s = 0; s < 10; s++) {
        const ang = (s * Math.PI * 2) / 10 + ph * 0.5;
        const stem = radius + 3.5 + Math.abs(Math.sin(s * 2.3)) * 2;
        const tx = x + Math.cos(ang) * stem;
        const ty = y + Math.sin(ang) * stem;
        g.moveTo(x + Math.cos(ang) * (radius - 1), y + Math.sin(ang) * (radius - 1));
        g.lineTo(tx, ty);
        g.stroke({ width: 1.6, color: accent, cap: 'round' });
        g.circle(tx, ty, 1.8 + Math.abs(Math.sin(s * 3.1)) * 0.8);
        g.fill({ color: light });
      }
      g.poly(blobPoints(x, y, radius, ph, 16, 0.08));
      g.fill({ color: base, alpha: 0.95 });
      g.stroke({ width: 1, color: light, alpha: 0.75 });
      g.circle(x, y + 1, radius * 0.38);
      g.fill({ color: dark, alpha: 0.75 });
      g.circle(x - 1, y, radius * 0.16);
      g.fill({ color: 0xfff3e0, alpha: 0.7 });
    } else if (enemy.typeId === 'CORONA_TITAN') {
      // Armored Virus: indigo lumpy capsid with receptor stubs and a red core bleeding through
      g.poly(blobPoints(x, y, radius, ph * 0.3, 20, 0.05));
      g.fill({ color: base, alpha: 0.95 });
      g.stroke({ width: 1.2, color: light, alpha: 0.7 });
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        g.moveTo(x + Math.cos(a) * radius * 0.35, y + Math.sin(a) * radius * 0.35);
        g.lineTo(x + Math.cos(a) * radius * 0.9, y + Math.sin(a) * radius * 0.9);
        g.stroke({ width: 0.7, color: light, alpha: 0.35 });
      }
      g.circle(x, y, radius * 0.5);
      g.fill({ color: accent, alpha: 0.55 });
      g.circle(x, y + 1, radius * 0.28);
      g.fill({ color: 0xe53935, alpha: 0.95 });
      g.circle(x - 1.2, y, radius * 0.1);
      g.fill({ color: 0xffebee, alpha: 0.8 });
      for (let i = 0; i < 10; i++) {
        const ang = (i * Math.PI * 2) / 10 + ph * 0.25;
        const lr = radius * 0.86 + Math.sin(i * 2.1) * 1.2;
        const lx = x + Math.cos(ang) * lr;
        const ly = y + Math.sin(ang) * lr;
        const sz = 3 + Math.abs(Math.sin(i * 3.3)) * 1.6;
        g.circle(lx, ly, sz);
        g.fill({ color: 0x3f51b5, alpha: 0.95 });
        g.stroke({ width: 0.6, color: light, alpha: 0.9 });
        for (let j = -1; j <= 1; j++) {
          const sa = ang + j * 0.3;
          g.moveTo(lx + Math.cos(sa) * sz, ly + Math.sin(sa) * sz);
          g.lineTo(lx + Math.cos(sa) * (sz + 2.5), ly + Math.sin(sa) * (sz + 2.5));
          g.stroke({ width: 1, color: light, alpha: 0.8, cap: 'round' });
        }
        g.circle(lx - sz * 0.35, ly - sz * 0.35, sz * 0.25);
        g.fill({ color: 0xffffff, alpha: 0.35 });
      }
    } else if (enemy.typeId === 'HEATSHOCK_CARRIER') {
      // Heat-Shock Carrier: crimson core wrapped in silver heat-shield plates
      g.circle(x, y, radius + 5);
      g.stroke({ width: 0.8, color: light, alpha: 0.35 + Math.sin(ph * 3) * 0.15 });
      drawFibers(g, x, y, radius - 1, 12, 1.5, radius * 0.4, 0.5, light, 0.4, ph, 0.8);
      g.poly(blobPoints(x, y, radius, ph * 0.5, 16, 0.07));
      g.fill({ color: base, alpha: 0.95 });
      g.stroke({ width: 1, color: 0xef9a9a, alpha: 0.7 });
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + ph * 0.35;
        const r1 = radius * 0.72;
        const r2 = radius * 1.18;
        const hw = 0.26;
        g.poly([
          x + Math.cos(a - hw) * r1, y + Math.sin(a - hw) * r1,
          x + Math.cos(a + hw) * r1, y + Math.sin(a + hw) * r1,
          x + Math.cos(a + hw * 0.8) * r2, y + Math.sin(a + hw * 0.8) * r2,
          x + Math.cos(a - hw * 0.8) * r2, y + Math.sin(a - hw * 0.8) * r2,
        ]);
        g.fill({ color: accent, alpha: 0.95 });
        g.stroke({ width: 0.7, color: 0xffffff, alpha: 0.8 });
      }
      g.circle(x, y + 0.5, radius * 0.36);
      g.fill({ color: 0xff5252, alpha: 0.95 });
      g.circle(x - 1, y - 0.5, radius * 0.14);
      g.fill({ color: 0xffffff, alpha: 0.85 });
      // Heat shimmer pulse
      g.circle(x, y, radius + 2 + Math.sin(ph * 4) * 1.5);
      g.stroke({ width: 1, color: 0xffffff, alpha: 0.2 });
    } else if (enemy.typeId === 'RETRO_MUTANT') {
      // Cytokine Storm: fire-cell with massive filament network and white-hot nucleus
      g.circle(x, y, radius + 12 + Math.sin(ph * 2) * 2);
      g.fill({ color: base, alpha: 0.1 });
      drawPseudopods(g, x, y, radius, 6, radius * 1.5, 0xffea00, 0.5, ph, 1.1);
      drawFibers(g, x, y, radius - 2, 26, 4, radius * 1.1, 0.72, 0xff6d00, 0.45, ph, 0.8);
      drawFibers(g, x, y, radius - 2, 18, 2, radius * 0.5, 0.55, 0xffea00, 0.6, ph + 1, 1);
      g.poly(blobPoints(x, y, radius, ph, 20, 0.12));
      g.fill({ color: 0xbf360c, alpha: 0.95 });
      g.stroke({ width: 1.2, color: 0xff9100, alpha: 0.9 });
      g.circle(x, y, radius * 0.72);
      g.fill({ color: 0xff9100, alpha: 0.9 });
      g.circle(x, y, radius * 0.5);
      g.fill({ color: 0xffea00, alpha: 0.9 });
      g.circle(x, y, radius * 0.3);
      g.fill({ color: 0xffff8d, alpha: 0.95 });
      g.circle(x, y, radius * 0.16 + Math.sin(ph * 5) * 0.6);
      g.fill({ color: 0xffffff });
      // Danger bio-aura ring
      g.circle(x, y, radius + 8);
      g.stroke({ width: 2, color: 0xff6d00, alpha: 0.4 + Math.sin(this.pulsePhase * 3) * 0.3 });
    } else {
      g.circle(x, y, radius);
      g.fill({ color: base, alpha: 0.9 });
      g.stroke({ width: 1.5, color: light, alpha: 0.75 });
    }
  }

  private renderProjectiles(): void {
    const g = this.projectileLayer;
    g.clear();

    // Render active laser beams from Killer T & IgA tethers
    for (const tower of this.engine.towers.values()) {
      if (tower.typeId === 'KILLER_T' && tower.beamLocks && tower.beamLocks.length > 1) {
        for (const lock of tower.beamLocks) {
          const t = this.engine.enemies.get(lock.targetId);
          if (!t || t.isDead || t.isLeaked) continue;
          const lockSec = Math.min(3, lock.lockDurationMs / 1000);
          g.moveTo(tower.position.x, tower.position.y);
          g.lineTo(t.position.x, t.position.y);
          g.stroke({ width: 1.5 + lockSec * 1.2, color: 0xfbbf24, alpha: 0.8 });
        }
        continue;
      }
      if (tower.targetId) {
        const target = this.engine.enemies.get(tower.targetId);
        if (target && !target.isDead && !target.isLeaked) {
          if (tower.typeId === 'KILLER_T') {
            // Thermal laser beam with a bright core that widens as it ramps
            const lockSec = Math.min(3, (tower.beamLockDurationMs || 0) / 1000);
            const beamWidth = 2 + lockSec * 2;
            g.moveTo(tower.position.x, tower.position.y);
            g.lineTo(target.position.x, target.position.y);
            g.stroke({ width: beamWidth + 3, color: 0xff6d00, alpha: 0.25 });
            g.moveTo(tower.position.x, tower.position.y);
            g.lineTo(target.position.x, target.position.y);
            g.stroke({ width: beamWidth, color: 0xfbbf24, alpha: 0.85 });
            g.moveTo(tower.position.x, tower.position.y);
            g.lineTo(target.position.x, target.position.y);
            g.stroke({ width: Math.max(1, beamWidth * 0.35), color: 0xfff9c4, alpha: 0.95 });
          } else if (tower.typeId === 'IGA') {
            // Cryo tether: crystalline green beam with drifting ice motes
            g.moveTo(tower.position.x, tower.position.y);
            g.lineTo(target.position.x, target.position.y);
            g.stroke({ width: 4, color: 0x10b981, alpha: 0.3 });
            g.moveTo(tower.position.x, tower.position.y);
            g.lineTo(target.position.x, target.position.y);
            g.stroke({ width: 2, color: 0xb9f6ca, alpha: 0.85 });
            const dx = target.position.x - tower.position.x;
            const dy = target.position.y - tower.position.y;
            for (let i = 0; i < 3; i++) {
              const t = ((this.pulsePhase * 0.5 + i / 3) % 1);
              const mx = tower.position.x + dx * t;
              const my = tower.position.y + dy * t;
              g.poly([mx, my - 2.5, mx + 2.5, my, mx, my + 2.5, mx - 2.5, my]);
              g.fill({ color: 0xe8ffe0, alpha: 0.9 });
            }
          }
        }
      }
    }

    // Render flying projectiles
    for (const proj of this.engine.projectiles) {
      if (proj.isDead) continue;
      const colorNum = parseInt(proj.color.replace('#', '0x'), 16);
      const px = proj.currentPosition.x;
      const py = proj.currentPosition.y;
      const heading = Math.atan2(proj.targetPosition.y - py, proj.targetPosition.x - px);

      if (proj.specialType === 'CLUSTER') {
        // IgM plasma cluster shell: mini pentamer of lobes spinning in flight
        g.circle(px, py, 8);
        g.fill({ color: colorNum, alpha: 0.25 });
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2 + this.pulsePhase * 4;
          g.circle(px + Math.cos(a) * 3.2, py + Math.sin(a) * 3.2, 2);
          g.fill({ color: 0xad1457 });
          g.stroke({ width: 0.6, color: 0xf48fb1 });
        }
        g.circle(px, py, 1.6);
        g.fill({ color: 0xfce4ec });
      } else if (proj.specialType === 'ENGULF') {
        // Macrophage engulfing glob: wobbling violet blob trailing pseudopods
        g.poly(blobPoints(px, py, 6, this.pulsePhase * 3, 12, 0.18));
        g.fill({ color: 0x5b21b6, alpha: 0.9 });
        g.stroke({ width: 1, color: 0xc4b5fd, alpha: 0.9 });
        for (let i = 0; i < 3; i++) {
          const a = heading + Math.PI + (i - 1) * 0.5;
          g.moveTo(px + Math.cos(a) * 4, py + Math.sin(a) * 4);
          g.quadraticCurveTo(
            px + Math.cos(a + 0.3) * 9,
            py + Math.sin(a + 0.3) * 9,
            px + Math.cos(a) * 13,
            py + Math.sin(a) * 13
          );
          g.stroke({ width: 1.6, color: 0xa78bfa, alpha: 0.7, cap: 'round' });
        }
        g.circle(px - 1, py - 1, 1.8);
        g.fill({ color: 0xede9fe, alpha: 0.9 });
      } else {
        // IgG photon bolt: tiny Y-antibody with a speed trail
        g.moveTo(px - Math.cos(heading) * 10, py - Math.sin(heading) * 10);
        g.lineTo(px, py);
        g.stroke({ width: 2.5, color: colorNum, alpha: 0.35, cap: 'round' });
        g.moveTo(px - Math.cos(heading) * 3.5, py - Math.sin(heading) * 3.5);
        g.lineTo(px, py);
        g.stroke({ width: 2, color: 0xb2ebf2, cap: 'round' });
        for (const side of [-0.7, 0.7]) {
          g.moveTo(px, py);
          g.lineTo(px + Math.cos(heading + side) * 3.5, py + Math.sin(heading + side) * 3.5);
          g.stroke({ width: 1.6, color: proj.isCrit ? 0xffffff : 0x00e5ff, cap: 'round' });
        }
        g.circle(px, py, proj.isCrit ? 2.6 : 1.8);
        g.fill({ color: 0xffffff });
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

    // Organic circular membrane placement rings and glow aura.
    g.circle(world.x, world.y, def.range);
    g.fill({ color, alpha: 0.08 });
    g.stroke({ width: 1.5, color, alpha: 0.5 });
    for (let ring = 0; ring < 3; ring++) {
      const radius = 15 + ring * 6 + Math.sin(this.pulsePhase * 2 + ring) * 1.5;
      g.circle(world.x, world.y, radius);
      g.stroke({ width: 1.5, color, alpha: 0.45 - ring * 0.1 });
    }
    g.circle(world.x, world.y, 10 + Math.sin(this.pulsePhase * 3) * 2);
    g.fill({ color, alpha: check.valid ? 0.16 : 0.1 });

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
