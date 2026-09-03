import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from '@/core/engine';
import { SoundSynth } from '@/audio/synth';
import { GameUI } from '@/ui/hud';
import { GameRenderer } from '@/render/gameRenderer';

// Minimal DOM mock for Node environment
class MockClassList {
  private classes = new Set<string>();
  add(...tokens: string[]): void {
    tokens.forEach((t) => this.classes.add(t));
  }
  remove(...tokens: string[]): void {
    tokens.forEach((t) => this.classes.delete(t));
  }
  contains(token: string): boolean {
    return this.classes.has(token);
  }
  toggle(token: string, force?: boolean): boolean {
    if (force !== undefined) {
      if (force) this.classes.add(token);
      else this.classes.delete(token);
      return force;
    }
    if (this.classes.has(token)) {
      this.classes.delete(token);
      return false;
    }
    this.classes.add(token);
    return true;
  }
  get value(): string {
    return Array.from(this.classes).join(' ');
  }
  set value(val: string) {
    this.classes.clear();
    val.split(/\s+/).filter(Boolean).forEach((c) => this.classes.add(c));
  }
}

class MockElement {
  id: string = '';
  tagName: string = 'DIV';
  classList = new MockClassList();
  private _className = '';
  private _innerHTML = '';
  innerText: string = '';
  value: string = '';
  style: Record<string, string> = {};
  attributes = new Map<string, string>();
  listeners: Record<string, ((e?: unknown) => void)[]> = {};

  get className(): string {
    return this.classList.value || this._className;
  }
  set className(val: string) {
    this._className = val;
    this.classList.value = val;
  }

  get innerHTML(): string {
    return this._innerHTML;
  }
  set innerHTML(val: string) {
    this._innerHTML = val;
    this.parseHTML(val);
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }
  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  addEventListener(event: string, handler: (e?: unknown) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);
  }

  dispatchEvent(event: string, data?: unknown): void {
    const handlers = this.listeners[event] || [];
    handlers.forEach((h) => h(data));
  }

  querySelector(_selector: string): MockElement | null {
    return null;
  }

  querySelectorAll<T extends MockElement = MockElement>(selector: string): T[] {
    const results: MockElement[] = [];
    for (const child of mockElementsRegistry.values()) {
      if (selector.startsWith('.') && child.classList.contains(selector.slice(1))) {
        if (!results.includes(child)) results.push(child);
      } else if (selector.startsWith('#') && child.id === selector.slice(1)) {
        if (!results.includes(child)) results.push(child);
      }
    }
    return results as unknown as T[];
  }

  private parseHTML(html: string): void {
    const tagRegex = /<([a-zA-Z0-9-]+)([^>]*)>/g;
    let match: RegExpExecArray | null;
    while ((match = tagRegex.exec(html)) !== null) {
      const tagName = match[1]?.toUpperCase() ?? 'DIV';
      const attrStr = match[2] ?? '';

      const idMatch = /id=["']([^"']+)["']/.exec(attrStr);
      const classMatch = /class=["']([^"']+)["']/.exec(attrStr);
      const valueMatch = /value=["']([^"']+)["']/.exec(attrStr);
      const testIdMatch = /data-testid=["']([^"']+)["']/.exec(attrStr);

      const el = new MockElement();
      el.tagName = tagName;
      if (idMatch && idMatch[1]) {
        el.id = idMatch[1];
        mockElementsRegistry.set(el.id, el);
      }
      if (classMatch && classMatch[1]) {
        el.className = classMatch[1];
      }
      if (valueMatch && valueMatch[1]) {
        el.value = valueMatch[1];
      }
      if (testIdMatch && testIdMatch[1]) {
        el.setAttribute('data-testid', testIdMatch[1]);
      }
    }
  }
}

const mockElementsRegistry = new Map<string, MockElement>();

const mockDocument = {
  getElementById(id: string): MockElement | null {
    return mockElementsRegistry.get(id) || null;
  },
  createElement(_tagName: string): MockElement {
    return new MockElement();
  },
};

describe('Pause Modal UI Enhancements', () => {
  let engine: GameEngine;
  let synth: SoundSynth;
  let ui: GameUI;
  let container: MockElement;
  let modalContainer: MockElement;

  beforeEach(() => {
    mockElementsRegistry.clear();

    (globalThis as unknown as { document: unknown }).document = mockDocument;
    (globalThis as unknown as { window: unknown }).window = {
      addEventListener: vi.fn(),
      setTimeout: vi.fn(),
      localStorage: {
        getItem: vi.fn(),
        setItem: vi.fn(),
      },
    };

    container = new MockElement();
    container.id = 'game-container';
    mockElementsRegistry.set(container.id, container);

    modalContainer = new MockElement();
    modalContainer.id = 'modal-container';
    mockElementsRegistry.set(modalContainer.id, modalContainer);

    const hudMute = new MockElement();
    hudMute.id = 'btn-mute';
    mockElementsRegistry.set(hudMute.id, hudMute);

    engine = new GameEngine();
    synth = new SoundSynth();

    const mockRenderer = {
      app: { renderer: null, canvas: null },
      activePlacementTower: null,
      hoveredCell: null,
    } as unknown as GameRenderer;

    ui = new GameUI(engine, mockRenderer, synth, container as unknown as HTMLElement);
  });

  it('renders pause modal with initial volume levels, mute status, and animated buttons', () => {
    synth.setMasterVolume(0.85);
    synth.setMusicVolume(0.65);
    synth.setMuted(false);

    ui.renderPauseModal();

    expect(modalContainer.classList.contains('hidden')).toBe(false);

    const masterDisplay = mockElementsRegistry.get('pause-master-vol-val');
    const musicDisplay = mockElementsRegistry.get('pause-music-vol-val');
    const masterSlider = mockElementsRegistry.get('slider-master-volume');
    const musicSlider = mockElementsRegistry.get('slider-music-volume');
    const muteBtn = mockElementsRegistry.get('btn-pause-mute');

    expect(masterDisplay).toBeDefined();
    expect(musicDisplay).toBeDefined();
    expect(masterSlider?.value).toBe('85');
    expect(musicSlider?.value).toBe('65');
    expect(muteBtn).toBeDefined();
  });

  it('adjusts master volume up and down via steppers and updates display', () => {
    synth.setMasterVolume(0.8);
    ui.renderPauseModal();

    const btnDown = mockElementsRegistry.get('btn-master-vol-down');
    const btnUp = mockElementsRegistry.get('btn-master-vol-up');
    const masterDisplay = mockElementsRegistry.get('pause-master-vol-val');
    const masterSlider = mockElementsRegistry.get('slider-master-volume');

    btnDown?.dispatchEvent('click');
    expect(synth.getMasterVolume()).toBe(0.7);
    expect(masterDisplay?.innerText).toBe('70%');
    expect(masterSlider?.value).toBe('70');

    btnUp?.dispatchEvent('click');
    expect(synth.getMasterVolume()).toBe(0.8);
    expect(masterDisplay?.innerText).toBe('80%');
    expect(masterSlider?.value).toBe('80');
  });

  it('adjusts master volume via range slider input', () => {
    synth.setMasterVolume(0.5);
    ui.renderPauseModal();

    const masterSlider = mockElementsRegistry.get('slider-master-volume');
    const masterDisplay = mockElementsRegistry.get('pause-master-vol-val');

    if (masterSlider) {
      masterSlider.value = '40';
      masterSlider.dispatchEvent('input');
    }

    expect(synth.getMasterVolume()).toBe(0.4);
    expect(masterDisplay?.innerText).toBe('40%');
  });

  it('adjusts music volume up and down via steppers and slider input', () => {
    synth.setMusicVolume(0.5);
    ui.renderPauseModal();

    const btnDown = mockElementsRegistry.get('btn-music-vol-down');
    const btnUp = mockElementsRegistry.get('btn-music-vol-up');
    const musicDisplay = mockElementsRegistry.get('pause-music-vol-val');
    const musicSlider = mockElementsRegistry.get('slider-music-volume');

    btnDown?.dispatchEvent('click');
    expect(synth.getMusicVolume()).toBe(0.4);
    expect(musicDisplay?.innerText).toBe('40%');
    expect(musicSlider?.value).toBe('40');

    btnUp?.dispatchEvent('click');
    btnUp?.dispatchEvent('click');
    expect(synth.getMusicVolume()).toBe(0.6);
    expect(musicDisplay?.innerText).toBe('60%');
    expect(musicSlider?.value).toBe('60');

    if (musicSlider) {
      musicSlider.value = '90';
      musicSlider.dispatchEvent('input');
    }
    expect(synth.getMusicVolume()).toBe(0.9);
    expect(musicDisplay?.innerText).toBe('90%');
  });

  it('toggles mute status and updates button label, classes, and HUD mute icon', () => {
    synth.setMuted(false);
    ui.renderPauseModal();

    const muteBtn = mockElementsRegistry.get('btn-pause-mute');
    const hudMute = mockElementsRegistry.get('btn-mute');

    muteBtn?.dispatchEvent('click');
    expect(synth.getMuted()).toBe(true);
    expect(muteBtn?.innerText).toContain('MUTED');
    expect(hudMute?.innerText).toBe('🔇');

    muteBtn?.dispatchEvent('click');
    expect(synth.getMuted()).toBe(false);
    expect(muteBtn?.innerText).toContain('UNMUTED');
    expect(hudMute?.innerText).toBe('🔊');
  });

  it('handles resume button click to resume game and hide modal', () => {
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });
    engine.dispatch({ type: 'PAUSE_GAME' });
    expect(engine.phase).toBe('PAUSED');

    ui.renderPauseModal();

    const resumeBtn = mockElementsRegistry.get('btn-pause-resume');
    resumeBtn?.dispatchEvent('click');

    expect(engine.phase).toBe('PLAYING');
    expect(modalContainer.classList.contains('hidden')).toBe(true);
  });

  it('handles restart button click to restart mission and hide modal', () => {
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });
    engine.dispatch({ type: 'PAUSE_GAME' });

    ui.renderPauseModal();

    const restartBtn = mockElementsRegistry.get('btn-pause-restart');
    restartBtn?.dispatchEvent('click');

    expect(engine.phase).toBe('PLAYING');
    expect(modalContainer.classList.contains('hidden')).toBe(true);
  });

  it('handles quit button click to return to main menu', () => {
    engine.dispatch({ type: 'START_GAME', mapId: 'VASCULAR_RUN', difficultyId: 'ACUTE' });
    engine.dispatch({ type: 'PAUSE_GAME' });

    ui.renderPauseModal();

    const quitBtn = mockElementsRegistry.get('btn-pause-quit');
    quitBtn?.dispatchEvent('click');

    expect(engine.phase).toBe('MAIN_MENU');
  });

  it('attaches hover sound listener to all animated pause buttons', () => {
    const playHoverSpy = vi.spyOn(synth, 'playHover').mockImplementation(() => {});

    ui.renderPauseModal();

    const buttons = [
      mockElementsRegistry.get('btn-pause-resume'),
      mockElementsRegistry.get('btn-pause-restart'),
      mockElementsRegistry.get('btn-pause-level-select'),
      mockElementsRegistry.get('btn-pause-quit'),
      mockElementsRegistry.get('btn-pause-mute'),
      mockElementsRegistry.get('btn-master-vol-down'),
      mockElementsRegistry.get('btn-master-vol-up'),
      mockElementsRegistry.get('btn-music-vol-down'),
      mockElementsRegistry.get('btn-music-vol-up'),
    ];

    buttons.forEach((btn) => {
      expect(btn).toBeDefined();
      expect(btn?.classList.contains('pause-btn-animated')).toBe(true);
      btn?.dispatchEvent('mouseenter');
    });

    expect(playHoverSpy).toHaveBeenCalledTimes(buttons.length);
  });
});
