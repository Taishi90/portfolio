import Phaser from 'phaser';
import IntroScene from './scenes/IntroScene.js';
import RoomScene from './scenes/RoomScene.js';
import { initUI } from './ui.js';
import { WORLD_W, WORLD_H, ZOOM } from './view.js';

// wait for the in-game font so text is not first drawn with the fallback font
await Promise.race([document.fonts.load('800 16px Nunito'), new Promise((r) => setTimeout(r, 1500))]).catch(() => {});

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  // high-res canvas, cameras zoom into the 320x240 world (see view.js)
  width: WORLD_W * ZOOM,
  height: WORLD_H * ZOOM,
  pixelArt: true,
  backgroundColor: '#0e0c18', // same as the page background (--c-bg)
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [IntroScene, RoomScene], // the first scene starts automatically
});

initUI(game);

// for debugging in the browser console while running npm run dev
if (import.meta.env.DEV) window.game = game;
