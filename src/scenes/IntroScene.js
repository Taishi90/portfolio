import Phaser from 'phaser';
import { createTextures, drawFacade, DOORWAY } from '../art.js';
import { PROFILE } from '../content.js';

const W = 320;
const H = 240;
// Light color used for the final fade, so the room "opens" from the same warm light
export const DOOR_LIGHT = [255, 246, 216];

// Opening animation: the player walks up to the house, the doors swing open,
// they step into the light and the camera follows them inside. Click / tap / any key skips it.
export default class IntroScene extends Phaser.Scene {
  constructor() {
    super('Intro');
  }

  create() {
    createTextures(this);
    this.done = false;
    const { x, y, w, h } = DOORWAY;
    const doorX = x + w / 2;

    this.addStars();
    drawFacade(this, W, H);
    this.addText(doorX, y - 15, 'WELCOME', 18, '#2b1d1d', 0);
    this.addText(W / 2, 18, PROFILE.name, 36, '#ffffff', 8);
    this.addText(W / 2, 36, PROFILE.role, 20, '#ffd23f', 6);
    this.hint = this.addText(W / 2, H - 10, 'Click, tap or press any key to skip', 16, '#ffffff', 5).setAlpha(0.6);

    for (const lx of [x - 22, x + w + 22]) {
      const lamp = this.add.image(lx, y + 18, 'lamp');
      this.tweens.add({ targets: lamp, alpha: 0.75, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    // light spilling onto the step once the doors are open
    this.glow = this.add.graphics().setAlpha(0);
    this.glow.fillStyle(0xffe8a3, 0.35);
    this.glow.fillTriangle(x, y + h, x + w, y + h, doorX + 60, H);
    this.glow.fillTriangle(x, y + h, doorX - 60, H, doorX + 60, H);

    // doors hinge on the frame: left leaf from its left edge, right leaf from its right edge
    this.leftDoor = this.add.image(x, y, 'door-leaf').setOrigin(0, 0);
    this.rightDoor = this.add.image(x + w, y, 'door-leaf').setOrigin(1, 0).setFlipX(true);

    this.player = this.add.sprite(doorX, H + 10, 'player', 'up0').setDepth(10);

    const cam = this.cameras.main;
    cam.fadeIn(500, 0, 0, 0);

    this.input.once('pointerdown', () => this.enter());
    this.input.keyboard.once('keydown', () => this.enter());

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.time.delayedCall(600, () => this.enter());
      return;
    }

    // 1. walk up to the door
    this.player.anims.play('walk-up');
    this.tweens.add({
      targets: this.player,
      y: y + h + 4,
      delay: 300,
      duration: 1100,
      onComplete: () => {
        this.player.anims.stop();
        this.player.setFrame('up0');
        this.openDoors(doorX, y + h);
      },
    });
  }

  // 2. doors swing open, light pours out, 3. step inside while the camera zooms in
  openDoors(doorX, floorY) {
    this.tweens.add({ targets: [this.leftDoor, this.rightDoor], scaleX: 0.12, duration: 800, delay: 250, ease: 'Cubic.inOut' });
    // darken the leaves as they turn away from us
    const from = Phaser.Display.Color.ValueToColor(0xffffff);
    const to = Phaser.Display.Color.ValueToColor(0x7a6a5a);
    this.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 800,
      delay: 250,
      onUpdate: (tw) => {
        const c = Phaser.Display.Color.Interpolate.ColorWithColor(from, to, 100, tw.getValue());
        const tint = Phaser.Display.Color.GetColor(c.r, c.g, c.b);
        this.leftDoor.setTint(tint);
        this.rightDoor.setTint(tint);
      },
    });
    this.tweens.add({ targets: this.glow, alpha: 1, duration: 600, delay: 450 });
    this.time.delayedCall(1150, () => {
      this.player.anims.play('walk-up');
      this.tweens.add({ targets: this.player, y: floorY - 22, alpha: 0.2, duration: 900 });
      const cam = this.cameras.main;
      cam.pan(doorX, DOORWAY.y + DOORWAY.h / 2, 1100, 'Sine.easeIn');
      cam.zoomTo(5, 1100, 'Sine.easeIn');
      this.time.delayedCall(700, () => this.enter());
    });
  }

  // 4. fade into the light and start the room (also used to skip)
  enter() {
    if (this.done) return;
    this.done = true;
    const cam = this.cameras.main;
    cam.fadeOut(450, ...DOOR_LIGHT);
    cam.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => this.scene.start('Room'));
  }

  addStars() {
    for (let i = 0; i < 40; i++) {
      const star = this.add.rectangle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, 50), 1, 1, 0xffffff);
      star.setAlpha(Phaser.Math.FloatBetween(0.3, 1));
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(600, 1600),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1500),
      });
    }
  }

  // Text drawn large then scaled down with smooth filtering (same trick as the room labels)
  addText(x, y, text, size, color, stroke) {
    const t = this.add
      .text(x, y, text, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: `${size}px`,
        fontStyle: 'bold',
        color,
        stroke: '#1a1423',
        strokeThickness: stroke,
      })
      .setOrigin(0.5)
      .setScale(1 / 3)
      .setDepth(5);
    t.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    return t;
  }
}
