import { GameEngine } from '@/core/engine';
import { GameRenderer } from '@/render/gameRenderer';
import { SoundSynth } from '@/audio/synth';
import { HighScoreManager } from '@/persistence/highScores';
import { TowerTypeId, MapId, DifficultyId } from '@/core/types';
import { TOWER_DEFINITIONS } from '@/data/towers';
import { ALL_MAPS } from '@/data/maps';
import { DIFFICULTY_MODIFIERS } from '@/data/difficulties';

export class GameUI {
  private engine: GameEngine;
  private renderer: GameRenderer;
  private synth: SoundSynth;
  private container: HTMLElement;

  private selectedMapId: MapId = 'VASCULAR_RUN';
  private selectedDifficultyId: DifficultyId = 'ACUTE';

  constructor(engine: GameEngine, renderer: GameRenderer, synth: SoundSynth, container: HTMLElement) {
    this.engine = engine;
    this.renderer = renderer;
    this.synth = synth;
    this.container = container;

    this.setupKeyboardListeners();

    // Subscribe to engine events for audio & UI state changes
    this.engine.events.subscribe((event) => {
      this.updateHUD();
      if (event.type === 'ATP_CHANGED' || event.type === 'TOWER_PLACED' || event.type === 'TOWER_UPGRADED' || event.type === 'TOWER_SOLD') {
        this.renderTowerDock();
        this.updateTowerInspector();
      }
      if (event.type === 'TOWER_FIRED') {
        if (event.projectileType === 'CLUSTER') {
          this.synth.playExplosion();
        } else if (event.projectileType === 'CRYO_TETHER') {
          this.synth.playFreeze();
        } else {
          this.synth.playLaser();
        }
      } else if (event.type === 'ENEMY_DEFEATED') {
        this.synth.playKill();
      } else if (event.type === 'CORE_DAMAGED') {
        this.synth.playLeak();
      } else if (event.type === 'TOWER_PLACED') {
        this.synth.playPlace();
      } else if (event.type === 'TOWER_UPGRADED') {
        this.synth.playUpgrade();
      } else if (event.type === 'GAME_VICTORY' || event.type === 'GAME_DEFEAT') {
        HighScoreManager.saveScore({
          mapId: this.selectedMapId,
          difficultyId: this.selectedDifficultyId,
          score: this.engine.score,
          wavesCompleted: this.engine.stats.wavesCompleted,
          totalWaves: this.engine.totalWaves,
          outcome: event.type === 'GAME_VICTORY' ? 'VICTORY' : 'DEFEAT',
        });
        this.renderResultsModal(event.type === 'GAME_VICTORY');
      }
    });
  }

  public render(): void {
    this.container.innerHTML = `
      <!-- HUD Top Telemetry Bar -->
      <div id="hud-top" class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3 bg-bio-surface/80 backdrop-blur-md border-b border-bio-border shadow-lg">
        <div class="flex items-center gap-6">
          <div class="flex flex-col">
            <span class="text-xs uppercase text-bio-muted font-body tracking-wider">Wave Telemetry</span>
            <span id="hud-wave" class="font-mono text-lg font-bold text-bio-cyan neon-glow-cyan" data-testid="hud-wave">WAVE 01 / 10</span>
          </div>
          <div id="hud-timer-container" class="flex items-center gap-2">
            <span id="hud-countdown" class="font-mono text-sm text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded border border-amber-400/30">NEXT: 12.0s</span>
            <button id="btn-send-early" class="px-3 py-1 bg-bio-cyan/20 hover:bg-bio-cyan/30 text-bio-cyan text-xs font-mono font-bold rounded border border-bio-cyan/40 transition active:scale-95" data-testid="btn-send-early">
              ⚡ SEND NOW (+ATP)
            </button>
          </div>
        </div>

        <div class="flex items-center gap-8">
          <div class="flex items-center gap-2">
            <span class="text-xl">⚡</span>
            <div class="flex flex-col">
              <span class="text-xs uppercase text-bio-muted font-body tracking-wider">Available ATP</span>
              <span id="hud-atp" class="font-mono text-xl font-bold text-bio-amber neon-glow-amber" data-testid="hud-atp">450</span>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <span class="text-xl">❤️</span>
            <div class="flex flex-col min-w-[130px]">
              <div class="flex justify-between text-xs font-body tracking-wider mb-1">
                <span class="text-bio-muted uppercase">Organ Integrity</span>
                <span id="hud-integrity-num" class="font-mono font-bold text-bio-emerald">100%</span>
              </div>
              <div class="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-bio-border">
                <div id="hud-integrity-bar" class="bg-gradient-to-r from-bio-emerald to-bio-cyan h-full transition-all duration-300" style="width: 100%;"></div>
              </div>
            </div>
          </div>

          <div class="flex flex-col">
            <span class="text-xs uppercase text-bio-muted font-body tracking-wider">Score</span>
            <span id="hud-score" class="font-mono text-lg font-bold text-purple-300" data-testid="hud-score">0</span>
          </div>
        </div>

        <!-- Controls: Speed, Pause, Mute -->
        <div class="flex items-center gap-3">
          <div class="flex bg-bio-card rounded border border-bio-border p-0.5">
            <button id="btn-speed-1" class="px-2 py-0.5 text-xs font-mono rounded bg-bio-cyan/20 text-bio-cyan font-bold" data-testid="btn-speed-1">1x</button>
            <button id="btn-speed-2" class="px-2 py-0.5 text-xs font-mono rounded text-bio-muted hover:text-bio-text font-bold" data-testid="btn-speed-2">2x</button>
            <button id="btn-speed-3" class="px-2 py-0.5 text-xs font-mono rounded text-bio-muted hover:text-bio-text font-bold" data-testid="btn-speed-3">3x</button>
          </div>
          <button id="btn-pause" class="p-2 bg-bio-card hover:bg-bio-surface rounded border border-bio-border text-bio-cyan transition" title="Pause Game (Space)" data-testid="btn-pause">
            ⏸️
          </button>
          <button id="btn-mute" class="p-2 bg-bio-card hover:bg-bio-surface rounded border border-bio-border text-bio-muted transition" title="Toggle Audio" data-testid="btn-mute">
            🔊
          </button>
        </div>
      </div>

      <!-- Canvas Mount Container -->
      <div id="canvas-wrapper" class="flex-1 w-full h-full flex items-center justify-center overflow-hidden">
        <!-- Pixi Canvas inserted here -->
      </div>

      <!-- HUD Bottom Tower Dock -->
      <div id="hud-dock" class="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-4 py-3 bg-bio-surface/85 backdrop-blur-md border-t border-bio-border">
        <!-- Populated dynamically with Tower Cards -->
      </div>

      <!-- Tower Inspector Side Panel -->
      <div id="tower-inspector" class="absolute top-20 right-6 z-20 w-80 bg-bio-surface/95 backdrop-blur-lg border border-bio-border rounded-xl p-5 shadow-2xl hidden transition-all">
        <!-- Populated when tower is selected -->
      </div>

      <!-- Main Modals Container (Menu, Level Select, Pause, Results) -->
      <div id="modal-container" class="absolute inset-0 z-50 flex items-center justify-center bg-bio-bg/90 backdrop-blur-md">
        <!-- Render current active modal -->
      </div>
    `;

    this.renderTowerDock();
    this.setupHUDButtonListeners();
    this.renderMainMenuModal();
  }

  private renderTowerDock(): void {
    const dock = document.getElementById('hud-dock');
    if (!dock) return;

    const towerTypes: TowerTypeId[] = ['IGG', 'IGM', 'IGA', 'KILLER_T'];
    dock.innerHTML = towerTypes
      .map((typeId, idx) => {
        const def = TOWER_DEFINITIONS[typeId];
        const hotkey = idx + 1;
        const isSelected = this.renderer.activePlacementTower === typeId;
        const canAfford = this.engine.atp >= def.cost;

        return `
          <button
            data-tower-type="${typeId}"
            class="tower-card relative flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'bg-bio-cyan/20 border-bio-cyan shadow-[0_0_15px_rgba(0,245,255,0.3)]'
                : canAfford
                ? 'bg-bio-card/90 hover:bg-bio-card border-bio-border hover:border-bio-cyan/50 text-bio-text'
                : 'bg-bio-card/40 border-bio-border/40 text-bio-muted opacity-60'
            }"
            data-testid="tower-card-${typeId.toLowerCase()}"
          >
            <span class="absolute -top-2 -left-2 w-5 h-5 bg-bio-surface border border-bio-border rounded text-[10px] font-mono flex items-center justify-center font-bold text-bio-cyan">
              ${hotkey}
            </span>
            <div class="w-8 h-8 rounded-full flex items-center justify-center border" style="border-color: ${def.color}; background-color: ${def.color}22;">
              <span class="w-3.5 h-3.5 rounded-full" style="background-color: ${def.color};"></span>
            </div>
            <div class="flex flex-col text-left">
              <span class="text-xs font-bold font-title tracking-wide text-bio-text">${def.name}</span>
              <span class="text-[11px] font-body text-bio-muted">${def.role}</span>
            </div>
            <div class="flex items-center gap-1 ml-2 font-mono text-sm font-bold text-bio-amber">
              ⚡ ${def.cost}
            </div>
          </button>
        `;
      })
      .join('');

    dock.querySelectorAll<HTMLButtonElement>('.tower-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        const typeId = btn.getAttribute('data-tower-type') as TowerTypeId;
        if (this.renderer.activePlacementTower === typeId) {
          this.renderer.activePlacementTower = null;
        } else {
          this.renderer.activePlacementTower = typeId;
        }
        this.renderTowerDock();
      });
    });
  }

  public updateHUD(): void {
    const waveElem = document.getElementById('hud-wave');
    const timerElem = document.getElementById('hud-countdown');
    const timerContainer = document.getElementById('hud-timer-container');
    const atpElem = document.getElementById('hud-atp');
    const scoreElem = document.getElementById('hud-score');
    const integrityNum = document.getElementById('hud-integrity-num');
    const integrityBar = document.getElementById('hud-integrity-bar');

    if (waveElem) {
      const displayWave = Math.min(this.engine.waveIndex + 1, this.engine.totalWaves);
      waveElem.innerText = `WAVE ${String(displayWave).padStart(2, '0')} / ${this.engine.totalWaves}`;
    }

    if (timerElem && timerContainer) {
      if (this.engine.waveState === 'PREPARING') {
        timerContainer.classList.remove('hidden');
        const secs = (Math.max(0, this.engine.waveCountdownMs) / 1000).toFixed(1);
        timerElem.innerText = `NEXT: ${secs}s`;
      } else {
        timerContainer.classList.add('hidden');
      }
    }

    if (atpElem && atpElem.innerText !== `${this.engine.atp}`) {
      atpElem.innerText = `${this.engine.atp}`;
    }

    if (scoreElem && scoreElem.innerText !== `${this.engine.score.toLocaleString()}`) {
      scoreElem.innerText = `${this.engine.score.toLocaleString()}`;
    }

    if (integrityNum && integrityBar) {
      const intVal = `${Math.round(this.engine.integrity)}%`;
      if (integrityNum.innerText !== intVal) {
        integrityNum.innerText = intVal;
        integrityBar.style.width = `${Math.max(0, this.engine.integrity)}%`;
        if (this.engine.integrity <= 25) {
          integrityBar.className = 'bg-bio-coral h-full transition-all duration-300';
        } else {
          integrityBar.className = 'bg-gradient-to-r from-bio-emerald to-bio-cyan h-full transition-all duration-300';
        }
      }
    }
  }

  private updateTowerInspector(): void {
    const inspector = document.getElementById('tower-inspector');
    if (!inspector) return;

    if (!this.engine.selectedTowerId) {
      inspector.classList.add('hidden');
      return;
    }

    const tower = this.engine.towers.get(this.engine.selectedTowerId);
    if (!tower) {
      inspector.classList.add('hidden');
      return;
    }

    inspector.classList.remove('hidden');
    const def = TOWER_DEFINITIONS[tower.typeId];
    const refund = Math.floor(tower.totalInvestedAtp * 0.7);

    let upgradeSectionHtml = '';
    const formatPct = (mult: number): string => `+${Math.round((mult - 1) * 100)}%`;

    if (tower.level === 1) {
      const uCost = def.tier1Upgrade.cost;
      const t1Parts = [
        [def.tier1Upgrade.damageMultiplier, 'DMG'],
        [def.tier1Upgrade.rangeMultiplier, 'Range'],
        [def.tier1Upgrade.fireRateMultiplier, 'Fire Rate'],
      ]
        .filter(([mult]) => (mult as number) !== 1)
        .map(([mult, label]) => `${formatPct(mult as number)} ${label}`)
        .join(', ') || 'No stat changes';
      const canAfford = this.engine.atp >= uCost;
      upgradeSectionHtml = `
        <button id="btn-upgrade-t1" class="w-full mt-3 py-2 px-3 rounded-lg border font-mono text-xs font-bold transition ${
          canAfford
            ? 'bg-bio-cyan/20 hover:bg-bio-cyan/30 text-bio-cyan border-bio-cyan/50'
            : 'bg-bio-card/40 text-bio-muted border-bio-border/40 opacity-50'
        }" data-testid="btn-upgrade-t1">
          ⬆️ UPGRADE TIER 1 (⚡ ${uCost})
          <span class="block text-[10px] font-body text-bio-muted font-normal mt-0.5">${t1Parts}</span>
        </button>
      `;
    } else if (tower.level === 2) {
      const bACost = def.branchA.cost;
      const bBCost = def.branchB.cost;
      const canA = this.engine.atp >= bACost;
      const canB = this.engine.atp >= bBCost;

      upgradeSectionHtml = `
        <div class="mt-3 flex flex-col gap-2">
          <span class="text-[11px] font-body uppercase text-bio-amber tracking-wider">Choose Specialization Branch:</span>
          <button id="btn-branch-a" class="py-2 px-3 rounded-lg border font-mono text-xs text-left transition ${
            canA
              ? 'bg-bio-cyan/15 hover:bg-bio-cyan/25 text-bio-cyan border-bio-cyan/40'
              : 'bg-bio-card/40 text-bio-muted border-bio-border/40 opacity-50'
          }" data-testid="btn-branch-a">
            <div class="font-bold">BRANCH A: ${def.branchA.name} (⚡ ${bACost})</div>
            <div class="text-[10px] font-body text-bio-muted">${def.branchA.description}</div>
          </button>
          <button id="btn-branch-b" class="py-2 px-3 rounded-lg border font-mono text-xs text-left transition ${
            canB
              ? 'bg-bio-magenta/15 hover:bg-bio-magenta/25 text-bio-magenta border-bio-magenta/40'
              : 'bg-bio-card/40 text-bio-muted border-bio-border/40 opacity-50'
          }" data-testid="btn-branch-b">
            <div class="font-bold">BRANCH B: ${def.branchB.name} (⚡ ${bBCost})</div>
            <div class="text-[10px] font-body text-bio-muted">${def.branchB.description}</div>
          </button>
        </div>
      `;
    } else if (tower.level === 3) {
      const isBranchA = tower.selectedBranch === 'A';
      const tier3 = isBranchA ? def.tier3UpgradeA : def.tier3UpgradeB;
      const canAfford = this.engine.atp >= tier3.cost;

      upgradeSectionHtml = `
        <button id="btn-upgrade-t3" class="w-full mt-3 py-2 px-3 rounded-lg border font-mono text-xs font-bold transition ${
          canAfford
            ? 'bg-bio-amber/20 hover:bg-bio-amber/30 text-bio-amber border-bio-amber/50'
            : 'bg-bio-card/40 text-bio-muted border-bio-border/40 opacity-50'
        }" data-testid="btn-upgrade-t3">
          👑 MASTER TIER 3 (⚡ ${tier3.cost})
          <span class="block text-[10px] font-body text-bio-muted font-normal mt-0.5">${formatPct(tier3.damageMultiplier)} Apex Bio-Damage Multiplier</span>
        </button>
      `;
    } else {
      upgradeSectionHtml = `
        <div class="mt-3 text-center py-2 bg-bio-card/60 rounded border border-bio-border/40 text-[11px] font-mono text-bio-emerald font-bold">
          ⭐ MAXIMUM APEX TIER REACHED
        </div>
      `;
    }

    inspector.innerHTML = `
      <div class="flex items-center justify-between pb-3 border-b border-bio-border">
        <div class="flex items-center gap-2.5">
          <span class="w-3 h-3 rounded-full" style="background-color: ${tower.color};"></span>
          <span class="font-title text-sm font-bold text-bio-text">${tower.name}</span>
        </div>
        <button id="btn-close-inspector" class="text-bio-muted hover:text-bio-text text-sm">✕</button>
      </div>

      <div class="grid grid-cols-2 gap-2 my-3 font-mono text-xs text-bio-muted">
        <div>DMG: <span class="text-bio-text font-bold">${tower.damage}</span></div>
        <div>RNG: <span class="text-bio-text font-bold">${tower.range}px</span></div>
        <div>RATE: <span class="text-bio-text font-bold">${(1000 / tower.fireIntervalMs).toFixed(1)}/s</span></div>
        <div>TIER: <span class="text-bio-amber font-bold">${tower.level} ${tower.selectedBranch ? `(${tower.selectedBranch})` : ''}</span></div>
      </div>

      <!-- Target Mode Toggle -->
      <div class="flex items-center justify-between my-2 py-1.5 px-2.5 bg-bio-card rounded border border-bio-border text-xs font-body">
        <span class="text-bio-muted uppercase">Target Priority:</span>
        <button id="btn-toggle-target" class="font-mono text-xs font-bold text-bio-cyan hover:underline" data-testid="btn-toggle-target">
          ${tower.targetMode} ⇄
        </button>
      </div>

      ${upgradeSectionHtml}

      <button id="btn-sell-tower" class="w-full mt-3 py-1.5 px-3 bg-bio-coral/10 hover:bg-bio-coral/20 text-bio-coral rounded border border-bio-coral/30 font-mono text-xs font-bold transition" data-testid="btn-sell-tower">
        💰 SELL ANTIBODY (+⚡ ${refund})
      </button>
    `;

    document.getElementById('btn-close-inspector')?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'SELECT_TOWER', towerId: null });
      this.updateTowerInspector();
    });

    document.getElementById('btn-toggle-target')?.addEventListener('click', () => {
      const nextMode = tower.targetMode === 'FIRST' ? 'STRONGEST' : 'FIRST';
      this.engine.dispatch({ type: 'SET_TARGET_MODE', towerId: tower.id, mode: nextMode });
      this.updateTowerInspector();
    });

    document.getElementById('btn-upgrade-t1')?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id });
      this.updateHUD();
    });

    document.getElementById('btn-branch-a')?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id, branch: 'A' });
      this.updateHUD();
    });

    document.getElementById('btn-branch-b')?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id, branch: 'B' });
      this.updateHUD();
    });

    document.getElementById('btn-upgrade-t3')?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'UPGRADE_TOWER', towerId: tower.id });
      this.updateHUD();
    });

    document.getElementById('btn-sell-tower')?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'SELL_TOWER', towerId: tower.id });
      this.updateHUD();
    });
  }

  public renderMainMenuModal(): void {
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="flex flex-col items-center max-w-lg w-full p-8 bg-bio-surface/95 border border-bio-cyan/40 rounded-2xl shadow-[0_0_50px_rgba(0,245,255,0.2)] text-center">
        <h1 class="font-title text-4xl font-extrabold text-bio-cyan neon-glow-cyan tracking-wider mb-2">
          CYBER-IMMUNOLOGY
        </h1>
        <p class="font-body text-sm text-bio-muted uppercase tracking-widest mb-8">
          Neon Microcosm • Cellular Defense System
        </p>

        <div class="flex flex-col w-full gap-3.5 mb-6">
          <button id="btn-menu-start" class="w-full py-3.5 bg-gradient-to-r from-bio-cyan to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-bio-bg font-title font-extrabold text-lg tracking-wider rounded-xl shadow-lg shadow-cyan-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0" data-testid="btn-menu-start">
            START DEFENSE
          </button>
          <button id="btn-menu-level-select" class="w-full py-2.5 bg-bio-card hover:bg-bio-surface text-bio-cyan font-mono text-sm font-bold tracking-wider rounded-xl border border-bio-border hover:border-bio-cyan/50 transition" data-testid="btn-menu-level-select">
            MAP & DIFFICULTY SELECT
          </button>
          <button id="btn-menu-high-scores" class="w-full py-2.5 bg-bio-card hover:bg-bio-surface text-purple-300 font-mono text-sm font-bold tracking-wider rounded-xl border border-bio-border hover:border-purple-400/50 transition" data-testid="btn-menu-high-scores">
            🏆 HIGH SCORES
          </button>
          <button id="btn-menu-how-to-play" class="w-full py-2.5 bg-bio-card hover:bg-bio-surface text-bio-muted hover:text-bio-text font-mono text-sm tracking-wider rounded-xl border border-bio-border transition" data-testid="btn-menu-how-to-play">
            HOW TO PLAY
          </button>
        </div>

        <div class="text-[11px] font-mono text-bio-muted/80">
          Vite • TypeScript • PixiJS • Web Audio Synth
        </div>
      </div>
    `;

    document.getElementById('btn-menu-start')?.addEventListener('click', () => {
      this.synth.startAmbientBgm();
      this.engine.dispatch({
        type: 'START_GAME',
        mapId: this.selectedMapId,
        difficultyId: this.selectedDifficultyId,
      });
      modal.classList.add('hidden');
      this.updateHUD();
    });

    document.getElementById('btn-menu-level-select')?.addEventListener('click', () => {
      this.renderLevelSelectModal();
    });

    document.getElementById('btn-menu-high-scores')?.addEventListener('click', () => {
      this.renderHighScoresModal();
    });

    document.getElementById('btn-menu-how-to-play')?.addEventListener('click', () => {
      this.renderHowToPlayModal();
    });
  }

  public renderLevelSelectModal(): void {
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    const maps = Object.values(ALL_MAPS);
    const difficulties = Object.values(DIFFICULTY_MODIFIERS);

    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="flex flex-col max-w-2xl w-full p-8 bg-bio-surface/95 border border-bio-cyan/40 rounded-2xl shadow-2xl text-left">
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-title text-2xl font-bold text-bio-cyan neon-glow-cyan">MAP & DIFFICULTY</h2>
          <button id="btn-close-level-select" class="text-bio-muted hover:text-bio-text font-mono text-lg">✕</button>
        </div>

        <!-- Map Selection Cards -->
        <span class="text-xs uppercase font-body tracking-wider text-bio-muted mb-2">Select Vascular Sector:</span>
        <div class="grid grid-cols-3 gap-3 mb-6">
          ${maps
            .map(
              (m) => `
            <button
              data-map-id="${m.id}"
              class="map-select-btn p-3 rounded-xl border text-left transition ${
                this.selectedMapId === m.id
                  ? 'bg-bio-cyan/15 border-bio-cyan shadow-[0_0_12px_rgba(0,245,255,0.2)]'
                  : 'bg-bio-card hover:bg-bio-surface border-bio-border text-bio-muted'
              }"
              data-testid="map-select-${m.id.toLowerCase()}"
            >
              <div class="font-title text-xs font-bold text-bio-text mb-1">${m.name}</div>
              <div class="text-[10px] font-body text-bio-muted leading-tight mb-2">${m.description}</div>
              <div class="text-[10px] font-mono text-bio-amber">Best: ${HighScoreManager.getBestScore(m.id, this.selectedDifficultyId).toLocaleString()}</div>
            </button>
          `
            )
            .join('')}
        </div>

        <!-- Difficulty Selection Cards -->
        <span class="text-xs uppercase font-body tracking-wider text-bio-muted mb-2">Select Infection Threat:</span>
        <div class="grid grid-cols-3 gap-3 mb-8">
          ${difficulties
            .map(
              (d) => `
            <button
              data-diff-id="${d.id}"
              class="diff-select-btn p-3 rounded-xl border text-left transition ${
                this.selectedDifficultyId === d.id
                  ? 'bg-bio-amber/15 border-bio-amber shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                  : 'bg-bio-card hover:bg-bio-surface border-bio-border text-bio-muted'
              }"
              data-testid="diff-select-${d.id.toLowerCase()}"
            >
              <div class="font-title text-xs font-bold text-bio-text mb-1">${d.name}</div>
              <div class="text-[10px] font-body text-bio-muted leading-tight">${d.description}</div>
            </button>
          `
            )
            .join('')}
        </div>

        <div class="flex justify-end gap-3">
          <button id="btn-level-back" class="px-5 py-2.5 bg-bio-card hover:bg-bio-surface rounded-xl border border-bio-border font-mono text-sm text-bio-muted">
            BACK
          </button>
          <button id="btn-level-launch" class="px-8 py-2.5 bg-bio-cyan hover:bg-cyan-400 text-bio-bg font-title font-bold text-sm tracking-wider rounded-xl shadow-lg shadow-cyan-500/20" data-testid="btn-level-launch">
            DEPLOY ANTIBODIES
          </button>
        </div>
      </div>
    `;

    modal.querySelectorAll<HTMLButtonElement>('.map-select-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedMapId = btn.getAttribute('data-map-id') as MapId;
        this.renderLevelSelectModal();
      });
    });

    modal.querySelectorAll<HTMLButtonElement>('.diff-select-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedDifficultyId = btn.getAttribute('data-diff-id') as DifficultyId;
        this.renderLevelSelectModal();
      });
    });

    document.getElementById('btn-close-level-select')?.addEventListener('click', () => this.renderMainMenuModal());
    document.getElementById('btn-level-back')?.addEventListener('click', () => this.renderMainMenuModal());

    document.getElementById('btn-level-launch')?.addEventListener('click', () => {
      this.synth.startAmbientBgm();
      this.engine.dispatch({
        type: 'START_GAME',
        mapId: this.selectedMapId,
        difficultyId: this.selectedDifficultyId,
      });
      modal.classList.add('hidden');
      this.updateHUD();
    });
  }

  public renderHighScoresModal(): void {
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    const scores = HighScoreManager.getScores(this.selectedMapId, this.selectedDifficultyId);

    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="flex flex-col max-w-lg w-full p-8 bg-bio-surface/95 border border-purple-500/40 rounded-2xl shadow-2xl text-left">
        <div class="flex justify-between items-center mb-6">
          <h2 class="font-title text-2xl font-bold text-purple-300">🏆 HIGH SCORES</h2>
          <button id="btn-close-scores" class="text-bio-muted hover:text-bio-text font-mono text-lg">✕</button>
        </div>

        <div class="text-xs font-mono text-bio-muted mb-4">
          SECTOR: <span class="text-bio-cyan font-bold">${this.selectedMapId}</span> • THREAT: <span class="text-bio-amber font-bold">${this.selectedDifficultyId}</span>
        </div>

        <div class="max-h-60 overflow-y-auto mb-6 flex flex-col gap-2">
          ${
            scores.length > 0
              ? scores
                  .map(
                    (s, i) => `
                <div class="flex justify-between items-center p-2.5 bg-bio-card rounded border border-bio-border text-xs font-mono">
                  <div class="flex items-center gap-3">
                    <span class="w-5 font-bold ${i === 0 ? 'text-bio-amber' : 'text-bio-muted'}">#${i + 1}</span>
                    <span class="${s.outcome === 'VICTORY' ? 'text-bio-cyan' : 'text-bio-coral'} font-bold">${s.outcome}</span>
                    <span class="text-bio-muted text-[10px]">${s.date}</span>
                  </div>
                  <div class="font-bold text-bio-text text-sm">${s.score.toLocaleString()} PTS</div>
                </div>
              `
                  )
                  .join('')
              : '<div class="text-center py-6 text-bio-muted font-body">No high scores recorded yet. Complete your first defense run!</div>'
          }
        </div>

        <button id="btn-scores-back" class="w-full py-2.5 bg-bio-card hover:bg-bio-surface rounded-xl border border-bio-border font-mono text-sm font-bold text-bio-muted">
          BACK TO MENU
        </button>
      </div>
    `;

    document.getElementById('btn-close-scores')?.addEventListener('click', () => this.renderMainMenuModal());
    document.getElementById('btn-scores-back')?.addEventListener('click', () => this.renderMainMenuModal());
  }

  public renderHowToPlayModal(): void {
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="flex flex-col max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 bg-bio-surface/98 border border-bio-cyan/40 rounded-2xl shadow-2xl text-left">
        <div class="flex justify-between items-center mb-4 pb-3 border-b border-bio-border">
          <div>
            <h2 class="font-title text-2xl font-bold text-bio-cyan neon-glow-cyan">CYBER-IMMUNOLOGY // FIELD MANUAL</h2>
            <p class="text-xs font-mono text-bio-muted uppercase tracking-wider">Tactical Guide & Antibody Matrix</p>
          </div>
          <button id="btn-close-help" class="text-bio-muted hover:text-bio-text font-mono text-lg">✕</button>
        </div>

        <div class="flex flex-col gap-4 font-body text-sm text-bio-text/90 mb-6 leading-relaxed">
          <!-- Section 1: Core Mechanics -->
          <div class="bg-bio-card/60 p-3.5 rounded-xl border border-bio-border/60">
            <h3 class="font-title text-sm font-bold text-bio-amber mb-1.5 uppercase">⚡ Core Combat & Resource Loop</h3>
            <p class="text-xs text-bio-muted mb-2">Defend the vital cellular core by synthesizing antibodies onto bio-nodes along the vascular stream. Pathogens leak damage into <strong>Organ Integrity</strong> (100% max).</p>
            <ul class="text-xs space-y-1 list-disc list-inside text-slate-300">
              <li><strong>ATP Currency:</strong> Earned by neutralizing pathogens, clearing waves, and calling waves early.</li>
              <li><strong>Send Early:</strong> Hit <span class="font-mono text-bio-cyan font-bold">SEND NOW</span> to skip countdown and receive <strong>+3 ATP & +25 Score</strong> per second skipped!</li>
              <li><strong>Sell Refund:</strong> Placed antibodies can be sold at any time for <strong>70% refund</strong> of total invested ATP.</li>
            </ul>
          </div>

          <!-- Section 2: Antibody Matrix Comparison -->
          <div>
            <h3 class="font-title text-sm font-bold text-bio-cyan mb-2 uppercase">🧬 Antibody Specialization Matrix</h3>
            <div class="grid grid-cols-2 gap-2.5 text-xs">
              <div class="p-3 bg-bio-card rounded-lg border border-bio-cyan/30">
                <div class="flex items-center justify-between font-title font-bold text-bio-cyan mb-1">
                  <span>🩵 IgG Pulse Sentinel</span>
                  <span class="font-mono text-[11px] text-bio-amber">⚡ 100</span>
                </div>
                <p class="text-[11px] text-bio-muted mb-1.5">Rapid kinetic bio-photons (2.85/s). Ideal vs fast <em>Rhinovirus</em> runners.</p>
                <div class="text-[10px] font-mono text-slate-400 space-y-0.5 border-t border-bio-border/40 pt-1">
                  <div>• <span class="text-bio-cyan font-bold">Branch A: Hyper-Gatling</span> (+60% fire rate, 25% crit chance)</div>
                  <div>• <span class="text-bio-cyan font-bold">Branch B: Chain Pulse</span> (Arcs to 3 nearby pathogens)</div>
                </div>
              </div>

              <div class="p-3 bg-bio-card rounded-lg border border-bio-magenta/30">
                <div class="flex items-center justify-between font-title font-bold text-bio-magenta mb-1">
                  <span>💜 IgM Cluster Cannon</span>
                  <span class="font-mono text-[11px] text-bio-amber">⚡ 150</span>
                </div>
                <p class="text-[11px] text-bio-muted mb-1.5">65px AoE plasma burst. Counters dense <em>Influenza</em> swarms & split packs.</p>
                <div class="text-[10px] font-mono text-slate-400 space-y-0.5 border-t border-bio-border/40 pt-1">
                  <div>• <span class="text-bio-magenta font-bold">Branch A: Plasma Rupture</span> (+50% blast radius + acid DoT)</div>
                  <div>• <span class="text-bio-magenta font-bold">Branch B: Cluster Shells</span> (Splits into 4 sub-bombs)</div>
                </div>
              </div>

              <div class="p-3 bg-bio-card rounded-lg border border-bio-emerald/30">
                <div class="flex items-center justify-between font-title font-bold text-bio-emerald mb-1">
                  <span>💚 IgA Cryo-Tether</span>
                  <span class="font-mono text-[11px] text-bio-amber">⚡ 125</span>
                </div>
                <p class="text-[11px] text-bio-muted mb-1.5">Continuous beam inflicting 40% slow (up to 80% cap) & cellular degradation.</p>
                <div class="text-[10px] font-mono text-slate-400 space-y-0.5 border-t border-bio-border/40 pt-1">
                  <div>• <span class="text-bio-emerald font-bold">Branch A: Deep Freeze</span> (70% slow + 25% brittle damage amp)</div>
                  <div>• <span class="text-bio-emerald font-bold">Branch B: Glacial Aura</span> (360° omni-freeze perimeter)</div>
                </div>
              </div>

              <div class="p-3 bg-bio-card rounded-lg border border-bio-amber/30">
                <div class="flex items-center justify-between font-title font-bold text-bio-amber mb-1">
                  <span>💛 Killer T-Cell Prism</span>
                  <span class="font-mono text-[11px] text-bio-amber">⚡ 225</span>
                </div>
                <p class="text-[11px] text-bio-muted mb-1.5">Thermal laser ramping up to 5x damage on locked target. Melts heavy armor.</p>
                <div class="text-[10px] font-mono text-slate-400 space-y-0.5 border-t border-bio-border/40 pt-1">
                  <div>• <span class="text-bio-amber font-bold">Branch A: Focused Ion Lance</span> (Up to 8x ramp cap + faster spool)</div>
                  <div>• <span class="text-bio-amber font-bold">Branch B: Multi-Prism Beam</span> (3 concurrent target locks)</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Pro Tips -->
          <div class="bg-bio-card/40 p-3 rounded-xl border border-bio-border/40 text-xs text-bio-muted">
            <span class="font-bold text-bio-text uppercase">💡 Tactical Pro-Tip:</span> Build a <em>Chokepoint Kill Zone</em> by placing <strong>IgA Cryo-Tethers</strong> at stream bends, backed by <strong>IgM Cluster Cannons</strong> and <strong>Killer T-Cell Prisms</strong> set to <em>STRONGEST</em> target priority!
          </div>
        </div>

        <button id="btn-help-back" class="w-full py-3 bg-bio-cyan hover:bg-cyan-400 text-bio-bg font-title font-bold text-sm tracking-wider rounded-xl transition shadow-lg shadow-cyan-500/20">
          RETURN TO MISSION
        </button>
      </div>
    `;

    document.getElementById('btn-close-help')?.addEventListener('click', () => this.renderMainMenuModal());
    document.getElementById('btn-help-back')?.addEventListener('click', () => this.renderMainMenuModal());
  }

  public renderPauseModal(): void {
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.classList.remove('hidden');
    modal.innerHTML = `
      <div class="flex flex-col items-center max-w-sm w-full p-8 bg-bio-surface/95 border border-bio-border rounded-2xl shadow-2xl text-center">
        <h2 class="font-title text-3xl font-bold text-bio-cyan neon-glow-cyan mb-6">PAUSED</h2>

        <div class="flex flex-col w-full gap-3 mb-2">
          <button id="btn-pause-resume" class="w-full py-3 bg-bio-cyan text-bio-bg font-title font-bold text-sm tracking-wider rounded-xl" data-testid="btn-pause-resume">
            RESUME DEFENSE
          </button>
          <button id="btn-pause-restart" class="w-full py-2.5 bg-bio-card hover:bg-bio-surface text-bio-text font-mono text-sm rounded-xl border border-bio-border" data-testid="btn-pause-restart">
            RESTART MISSION
          </button>
          <button id="btn-pause-quit" class="w-full py-2.5 bg-bio-card hover:bg-bio-surface text-bio-coral font-mono text-sm rounded-xl border border-bio-border" data-testid="btn-pause-quit">
            QUIT TO MAIN MENU
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-pause-resume')?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'RESUME_GAME' });
      modal.classList.add('hidden');
      this.updateHUD();
    });

    document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'RESTART_GAME' });
      modal.classList.add('hidden');
      this.updateHUD();
    });

    document.getElementById('btn-pause-quit')?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'QUIT_TO_MENU' });
      this.renderMainMenuModal();
    });
  }

  public renderResultsModal(isVictory: boolean): void {
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.classList.remove('hidden');
    const headerColor = isVictory ? 'text-bio-cyan neon-glow-cyan' : 'text-bio-coral neon-glow-coral';
    const headerTitle = isVictory ? 'HOST STABILIZED' : 'ORGAN COMPROMISED';
    const subTitle = isVictory
      ? 'All viral pathogens successfully neutralized.'
      : 'Pathogen load exceeded cellular threshold.';

    modal.innerHTML = `
      <div class="flex flex-col max-w-md w-full p-8 bg-bio-surface/95 border ${isVictory ? 'border-bio-cyan/50' : 'border-bio-coral/50'} rounded-2xl shadow-2xl text-center" data-testid="results-modal">
        <h2 class="font-title text-3xl font-extrabold ${headerColor} mb-1">${headerTitle}</h2>
        <p class="font-body text-xs text-bio-muted uppercase tracking-wider mb-6">${subTitle}</p>

        <!-- Stats Breakdown Card -->
        <div class="grid grid-cols-2 gap-3 p-4 bg-bio-card rounded-xl border border-bio-border font-mono text-xs text-left mb-6">
          <div>FINAL SCORE: <span class="block text-base font-bold text-bio-amber" data-testid="result-final-score">${this.engine.score.toLocaleString()}</span></div>
          <div>ORGAN INTEGRITY: <span class="block text-base font-bold ${isVictory ? 'text-bio-emerald' : 'text-bio-coral'}">${Math.round(this.engine.integrity)}%</span></div>
          <div>WAVES CLEARED: <span class="block font-bold text-bio-text">${this.engine.stats.wavesCompleted} / ${this.engine.totalWaves}</span></div>
          <div>VIRUSES NEUTRALIZED: <span class="block font-bold text-bio-cyan">${this.engine.stats.enemiesDefeated}</span></div>
          <div>TOTAL ATP EARNED: <span class="block font-bold text-bio-amber">${this.engine.stats.totalAtpEarned}</span></div>
          <div>SECTOR / THREAT: <span class="block font-bold text-bio-text">${this.selectedMapId} (${this.selectedDifficultyId})</span></div>
        </div>

        <div class="flex flex-col w-full gap-2.5">
          <button id="btn-result-retry" class="w-full py-3 ${isVictory ? 'bg-bio-cyan text-bio-bg' : 'bg-bio-coral text-white'} font-title font-bold text-sm tracking-wider rounded-xl shadow-lg transition transform hover:-translate-y-0.5" data-testid="btn-result-retry">
            RETRY MISSION
          </button>
          <button id="btn-result-level-select" class="w-full py-2.5 bg-bio-card hover:bg-bio-surface text-bio-text font-mono text-xs font-bold rounded-xl border border-bio-border">
            CHANGE MAP / DIFFICULTY
          </button>
          <button id="btn-result-menu" class="w-full py-2 bg-transparent text-bio-muted hover:text-bio-text font-mono text-xs">
            RETURN TO MENU
          </button>
        </div>
      </div>
    `;

    document.getElementById('btn-result-retry')?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'RESTART_GAME' });
      modal.classList.add('hidden');
      this.updateHUD();
    });

    document.getElementById('btn-result-level-select')?.addEventListener('click', () => {
      this.renderLevelSelectModal();
    });

    document.getElementById('btn-result-menu')?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'QUIT_TO_MENU' });
      this.renderMainMenuModal();
    });
  }

  private setupHUDButtonListeners(): void {
    document.getElementById('btn-send-early')?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'START_WAVE_EARLY' });
      this.updateHUD();
    });

    document.getElementById('btn-pause')?.addEventListener('click', () => {
      if (this.engine.phase === 'PLAYING') {
        this.engine.dispatch({ type: 'PAUSE_GAME' });
        this.renderPauseModal();
      } else if (this.engine.phase === 'PAUSED') {
        this.engine.dispatch({ type: 'RESUME_GAME' });
        document.getElementById('modal-container')?.classList.add('hidden');
      }
    });

    document.getElementById('btn-mute')?.addEventListener('click', () => {
      const muted = this.synth.toggleMute();
      const muteBtn = document.getElementById('btn-mute');
      if (muteBtn) {
        muteBtn.innerText = muted ? '🔇' : '🔊';
      }
    });

    // Sync mute icon with the persisted mute state restored by SoundSynth
    const muteBtnInit = document.getElementById('btn-mute');
    if (muteBtnInit) {
      muteBtnInit.innerText = this.synth.getMuted() ? '🔇' : '🔊';
    }

    // Speed Multipliers
    const s1 = document.getElementById('btn-speed-1');
    const s2 = document.getElementById('btn-speed-2');
    const s3 = document.getElementById('btn-speed-3');

    const updateSpeedUI = (mult: number) => {
      [s1, s2, s3].forEach((btn) => {
        btn?.classList.remove('bg-bio-cyan/20', 'text-bio-cyan');
        btn?.classList.add('text-bio-muted');
      });
      if (mult === 1) {
        s1?.classList.add('bg-bio-cyan/20', 'text-bio-cyan');
        s1?.classList.remove('text-bio-muted');
      } else if (mult === 2) {
        s2?.classList.add('bg-bio-cyan/20', 'text-bio-cyan');
        s2?.classList.remove('text-bio-muted');
      } else if (mult === 3) {
        s3?.classList.add('bg-bio-cyan/20', 'text-bio-cyan');
        s3?.classList.remove('text-bio-muted');
      }
    };

    s1?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'SET_SPEED', multiplier: 1 });
      updateSpeedUI(1);
    });
    s2?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'SET_SPEED', multiplier: 2 });
      updateSpeedUI(2);
    });
    s3?.addEventListener('click', () => {
      this.engine.dispatch({ type: 'SET_SPEED', multiplier: 3 });
      updateSpeedUI(3);
    });
  }

  public attachCanvasListeners(): void {
    if (!this.renderer.app.renderer) return;
    const canvas = this.renderer.app.canvas;
    if (!canvas) return;

    const getLogicalCoords = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const logicalWidth = this.engine.mapGrid.data.cols * this.engine.mapGrid.data.cellSize;
      const logicalHeight = this.engine.mapGrid.data.rows * this.engine.mapGrid.data.cellSize;

      // The canvas content is letterboxed inside its element box via
      // object-fit: contain, so compute the uniform scale and centering
      // offsets of the actual content rect before mapping to logical space.
      const scale = Math.min(rect.width / logicalWidth, rect.height / logicalHeight);
      const contentWidth = logicalWidth * scale;
      const contentHeight = logicalHeight * scale;
      const offsetX = rect.left + (rect.width - contentWidth) / 2;
      const offsetY = rect.top + (rect.height - contentHeight) / 2;

      const x = (e.clientX - offsetX) / scale;
      const y = (e.clientY - offsetY) / scale;
      return { x, y };
    };

    canvas.addEventListener('mousemove', (e) => {
      const coords = getLogicalCoords(e);
      if (!coords) return;
      const cell = this.engine.mapGrid.worldToCell(coords.x, coords.y);
      this.renderer.hoveredCell = cell;
    });

    canvas.addEventListener('mouseleave', () => {
      this.renderer.hoveredCell = null;
    });

    canvas.addEventListener('click', (e) => {
      const coords = getLogicalCoords(e);
      if (!coords) return;

      const cell = this.engine.mapGrid.worldToCell(coords.x, coords.y);

      if (this.renderer.activePlacementTower) {
        // Attempt to place tower
        const res = this.engine.dispatch({
          type: 'PLACE_TOWER',
          towerTypeId: this.renderer.activePlacementTower,
          col: cell.col,
          row: cell.row,
        });

        if (res.ok) {
          this.renderer.activePlacementTower = null;
          this.renderTowerDock();
          this.updateHUD();
        }
      } else {
        // Check if clicked an existing tower to select it
        let clickedTower: string | null = null;
        for (const tower of this.engine.towers.values()) {
          const dx = tower.position.x - coords.x;
          const dy = tower.position.y - coords.y;
          if (Math.hypot(dx, dy) <= 24) {
            clickedTower = tower.id;
            break;
          }
        }
        this.engine.dispatch({ type: 'SELECT_TOWER', towerId: clickedTower });
        this.updateHUD();
        this.updateTowerInspector();
      }
    });

    canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.renderer.activePlacementTower) {
        this.renderer.activePlacementTower = null;
        this.renderTowerDock();
      } else {
        this.engine.dispatch({ type: 'SELECT_TOWER', towerId: null });
        this.updateHUD();
        this.updateTowerInspector();
      }
    });
  }

  private setupKeyboardListeners(): void {
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (this.engine.phase === 'PLAYING') {
          this.engine.dispatch({ type: 'PAUSE_GAME' });
          this.renderPauseModal();
        } else if (this.engine.phase === 'PAUSED') {
          this.engine.dispatch({ type: 'RESUME_GAME' });
          document.getElementById('modal-container')?.classList.add('hidden');
        }
      } else if (e.key === '1') {
        this.renderer.activePlacementTower = 'IGG';
        this.renderTowerDock();
      } else if (e.key === '2') {
        this.renderer.activePlacementTower = 'IGM';
        this.renderTowerDock();
      } else if (e.key === '3') {
        this.renderer.activePlacementTower = 'IGA';
        this.renderTowerDock();
      } else if (e.key === '4') {
        this.renderer.activePlacementTower = 'KILLER_T';
        this.renderTowerDock();
      } else if (e.key === 'Escape') {
        this.renderer.activePlacementTower = null;
        this.engine.dispatch({ type: 'SELECT_TOWER', towerId: null });
        this.renderTowerDock();
        this.updateHUD();
      }
    });
  }
}
