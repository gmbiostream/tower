import './style.css';
import { GameEngine } from './core/engine';
import { GameRenderer } from './render/gameRenderer';
import { SoundSynth } from './audio/synth';
import { GameUI } from './ui/hud';

async function bootstrap() {
  const appRoot = document.querySelector<HTMLDivElement>('#app');
  if (!appRoot) return;

  const synth = new SoundSynth();
  const engine = new GameEngine('VASCULAR_RUN', 'ACUTE', 1337, undefined, synth);
  const renderer = new GameRenderer(engine);

  const ui = new GameUI(engine, renderer, synth, appRoot);
  ui.render();

  const canvasWrapper = document.getElementById('canvas-wrapper');
  if (canvasWrapper) {
    await renderer.init(canvasWrapper);
    ui.attachCanvasListeners();
  }

  // Debug harness exposed on window for tests and judges
  (window as unknown as { __game: unknown }).__game = {
    engine,
    renderer,
    synth,
    ui,
  };

  // Start immediately where autoplay is allowed, then retry the audio element after
  // the first user gesture in browsers that block unprompted playback.
  const unlockAudio = () => {
    synth.initContext();
    synth.startAmbientBgm();
    synth.resumeMusicTrack();
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  };
  synth.startAmbientBgm();
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('keydown', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });

  // Main game loop (RAF + fixed-timestep simulation accumulator)
  let lastTime = performance.now();

  function gameLoop(currentTime: number) {
    const deltaMs = Math.min(currentTime - lastTime, 100);
    lastTime = currentTime;

    // Advance simulation ticks deterministically
    engine.clock.advance(deltaMs, () => {
      engine.tick();
    });

    // Render graphics & particles
    renderer.render(deltaMs);

    // Update telemetry
    if (engine.phase === 'PLAYING') {
      ui.updateHUD();
    }

    requestAnimationFrame(gameLoop);
  }

  requestAnimationFrame(gameLoop);
}

bootstrap().catch((err) => {
  console.error('Failed to initialize Microcosm:', err);
});
