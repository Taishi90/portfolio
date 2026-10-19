import Phaser from 'phaser';
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
  scene: [RoomScene],
});

initUI(game);

// để debug trong console trình duyệt khi chạy npm run dev
if (import.meta.env.DEV) window.game = game;
