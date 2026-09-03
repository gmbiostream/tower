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

    const { cols, rows, cellSize } = this.engine.mapGrid.data;

    // Subtle vascular grid background
    g.rect(0, 0, cols * cellSize, rows * cellSize);
    g.fill({ color: 0x050814 });

    // Grid lines
    for (let c = 0; c <= cols; c++) {
      g.moveTo(c * cellSize, 0);
      g.lineTo(c * cellSize, rows * cellSize);
      g.stroke({ width: 1, color: 0x0e1638, alpha: 0.5 });
    }
    for (let r = 0; r <= rows; r++) {
      g.moveTo(0, r * cellSize);
      g.lineTo(cols * cellSize, r * cellSize);
      g.stroke({ width: 1, color: 0x0e1638, alpha: 0.5 });
    }

    // Blocked terrain cells
    for (const blocked of this.engine.mapGrid.data.blockedGridCells) {
      const bx = blocked.col * cellSize;
      const by = blocked.row * cellSize;
      g.roundRect(bx + 3, by + 3, cellSize - 6, cellSize - 6, 6);
      g.fill({ color: 0x09102b, alpha: 0.9 });
      g.stroke({ width: 1.5, color: 0x1a2758 });
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

    const { waypoints, cellSize } = this.engine.mapGrid.data;
    if (waypoints.length < 2) return;

    // Outer vascular channel glow
    g.moveTo(waypoints[0]!.x, waypoints[0]!.y);
    for (let i = 1; i < waypoints.length; i++) {
      g.lineTo(waypoints[i]!.x, waypoints[i]!.y);
    }
    g.stroke({
      width: cellSize * 0.75,
      color: 0x00f5ff,
      alpha: 0.12,
      cap: 'round',
      join: 'round',
    });

    // Inner stream channel
    g.moveTo(waypoints[0]!.x, waypoints[0]!.y);
    for (let i = 1; i < waypoints.length; i++) {
      g.lineTo(waypoints[i]!.x, waypoints[i]!.y);
    }
    g.stroke({
      width: cellSize * 0.45,
      color: 0x0a1e3f,
      alpha: 0.85,
      cap: 'round',
      join: 'round',
    });

    // Center pulsating bio-conduit line
    const pulseAlpha = 0.35 + Math.sin(this.pulsePhase) * 0.15;
    g.moveTo(waypoints[0]!.x, waypoints[0]!.y);
    for (let i = 1; i < waypoints.length; i++) {
      g.lineTo(waypoints[i]!.x, waypoints[i]!.y);
    }
    g.stroke({
      width: 3,
      color: 0x00f5ff,
      alpha: pulseAlpha,
      cap: 'round',
      join: 'round',
    });

    // Flowing bio-particles along path
    const totalDist = this.engine.mapGrid.totalPathLength;
    for (let d = this.pathFlowOffset; d < totalDist; d += 28) {
      const pt = this.engine.mapGrid.getPositionAlongPath(d);
      g.circle(pt.position.x, pt.position.y, 2);
      g.fill({ color: 0x00f5ff, alpha: 0.45 });
    }
  }

  private renderCore(): void {
    const g = this.coreLayer;
    g.clear();

    const { corePosition } = this.engine.mapGrid.data;
    const pulse = Math.sin(this.pulsePhase * 1.5) * 4;
    const integrityRatio = Math.max(0, this.engine.integrity / 100);

    // Outer glow halo (reacts to integrity)
    const coreColor = integrityRatio > 0.35 ? 0x00f5ff : 0xff0055;
    g.circle(corePosition.x, corePosition.y, 26 + pulse);
    g.fill({ color: coreColor, alpha: 0.2 * integrityRatio });

    // Middle cellular membrane
    g.circle(corePosition.x, corePosition.y, 18);
    g.fill({ color: 0x0e1f4d, alpha: 0.9 });
    g.stroke({ width: 2.5, color: coreColor, alpha: 0.8 });

    // Inner vital nucleus
    g.circle(corePosition.x, corePosition.y, 9);
    g.fill({ color: coreColor, alpha: 0.7 * integrityRatio + 0.3 });
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

      // Tower pedestal node
      g.circle(x, y, 18);
      g.fill({ color: 0x091024, alpha: 0.95 });
      g.stroke({ width: 2, color: colorNum, alpha: isSelected ? 1 : 0.7 });

      // Antibody Cellular Structure (Microscopy-inspired geometry)
      if (tower.typeId === 'IGG') {
        // IgG Pulse Sentinel: Y-shaped antibody geometry
        g.circle(x, y, 9);
        g.fill({ color: colorNum, alpha: 0.6 });
        // Firing nozzle
        g.circle(x, y, 4);
        g.fill({ color: 0xffffff });
      } else if (tower.typeId === 'IGM') {
        // IgM Cluster Cannon: Pentameric ring structure
        for (let a = 0; a < 5; a++) {
          const ang = (a * Math.PI * 2) / 5 + this.pulsePhase * 0.5;
          g.circle(x + Math.cos(ang) * 7, y + Math.sin(ang) * 7, 3.5);
          g.fill({ color: colorNum, alpha: 0.75 });
        }
        g.circle(x, y, 5);
        g.fill({ color: 0xffffff });
      } else if (tower.typeId === 'IGA') {
        // IgA Cryo-Tether: Dimeric dumbbell bio-receptor
        g.ellipse(x, y, 11, 6);
        g.fill({ color: colorNum, alpha: 0.7 });
        g.circle(x, y, 4);
        g.fill({ color: 0xffffff });
      } else if (tower.typeId === 'KILLER_T') {
        // Killer T-Cell: Thermal Prism
        const sz = 8;
        g.poly([x, y - sz, x + sz, y + sz * 0.7, x - sz, y + sz * 0.7]);
        g.fill({ color: colorNum, alpha: 0.85 });
        g.circle(x, y, 3.5);
        g.fill({ color: 0xffffff });
      }

      // Upgrade tier level pips
      for (let lvl = 1; lvl < tower.level; lvl++) {
        g.circle(x - 8 + (lvl - 1) * 7, y + 13, 2);
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
      g.fill({ color: colorNum, alpha: 0.85 });
      g.stroke({
        width: 1.5,
        color: isSlowed ? 0x10b981 : 0xffffff,
        alpha: 0.7,
      });

      // Inner dense genetic core
      g.circle(x, y, radius * 0.45);
      g.fill({ color: 0xffffff, alpha: 0.7 });

      // Corona Titan outer armor plates
      if (enemy.typeId === 'CORONA_TITAN') {
        for (let i = 0; i < 6; i++) {
          const ang = (i * Math.PI * 2) / 6 + this.pulsePhase;
          g.rect(x + Math.cos(ang) * 12 - 2, y + Math.sin(ang) * 12 - 2, 4, 4);
          g.fill({ color: 0xffffff, alpha: 0.8 });
        }
      }

      // Retro-Mutant boss multi-nucleus
      if (enemy.typeId === 'RETRO_MUTANT') {
        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI * 2) / 4 + this.pulsePhase * 2;
          g.circle(x + Math.cos(ang) * 8, y + Math.sin(ang) * 8, 4);
          g.fill({ color: 0xff3366, alpha: 0.9 });
        }
      }

      // Health bar above enemy
      const barW = Math.max(20, enemy.size + 4);
      const barH = 3;
      const barY = y - radius - 7;
      const hpRatio = Math.max(0, enemy.hp / enemy.maxHp);

      g.rect(x - barW / 2, barY, barW, barH);
      g.fill({ color: 0x000000, alpha: 0.6 });

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
