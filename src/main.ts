import './style.css';
import { GameEngine } from './core/engine';
import { GameRenderer } from './render/gameRenderer';
import { SoundSynth } from './audio/synth';
import { GameUI } from './ui/hud';

async function bootstrap() {
  const appRoot = document.querySelector<HTMLDivElement>('#app');
  if (!appRoot) return;

  const engine = new GameEngine('VASCULAR_RUN', 'ACUTE');
  const renderer = new GameRenderer(engine);
  const synth = new SoundSynth();

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

  // Automatically unlock audio and start soundtrack on first user gesture (click/key/touch)
  const unlockAudio = () => {
    synth.initContext();
    synth.startAmbientBgm();
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  };
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
  console.error('Failed to initialize Cyber-Immunology:', err);
});
