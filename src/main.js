import Phaser from 'phaser';
import RoomScene from './scenes/RoomScene.js';

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: 320,
  height: 240,
  pixelArt: true,
  backgroundColor: '#1a1423',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [RoomScene],
});
