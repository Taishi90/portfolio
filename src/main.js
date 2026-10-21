import Phaser from 'phaser';
import IntroScene from './scenes/IntroScene.js';
import RoomScene from './scenes/RoomScene.js';
import { initUI } from './ui.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 320,
  height: 240,
  pixelArt: true,
  backgroundColor: '#1a1423',
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [IntroScene, RoomScene], // the first scene starts automatically
});

initUI(game);

// for debugging in the browser console while running npm run dev
if (import.meta.env.DEV) window.game = game;
