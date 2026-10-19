import Phaser from 'phaser';

export default class RoomScene extends Phaser.Scene {
  constructor() {
    super('Room');
  }

  create() {
    this.add.text(160, 120, 'Hello Phaser!', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
  }
}
