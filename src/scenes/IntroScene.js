import Phaser from 'phaser';
import { createTextures, drawFacade, DOORWAY, R, PLAYER_SCALE } from '../art.js';
import { PROFILE } from '../content.js';
import { setupCamera, crispText, ZOOM, isDaytime } from '../view.js';

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

  // data.hold: build the scene but wait for begin() before animating (used when coming back from the
  // portfolio page: the house is visible under the transition tiles, the animation starts once they are gone)
  create(data = {}) {
    createTextures(this);
    setupCamera(this);
    this.done = false;
    this.started = false;
    const { x, y, w, h } = DOORWAY;
    const doorX = x + w / 2;

    const day = isDaytime();
    drawFacade(this, W, H, day);
    // after the facade, which paints the sky
    if (day) this.addSunAndClouds();
    else this.addStars();
    // sizes in world pixels (the screen shows the 320x240 world about 3-4x bigger)
    this.addText(doorX, y - 19.5, 'WELCOME', 7.5, '#7a3b00', 0);
    this.addText(W / 2, 18, PROFILE.name, 14, '#ffffff', 2.5);
    this.addText(W / 2, 35, PROFILE.role, 8, '#ffe066', 2);
    this.hint = this.addText(W / 2, H - 10, 'Click, tap or press any key to skip', 6.5, '#ffffff', 1.5).setAlpha(0.75);

    for (const lx of [x - 22, x + w + 22]) {
      const lamp = this.add.image(lx, y + 18, 'lamp').setScale(1 / R);
      if (day) continue; // lamps only glow at night
      this.tweens.add({ targets: lamp, alpha: 0.75, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    // light spilling onto the step once the doors are open
    this.glow = this.add.graphics().setAlpha(0);
    this.glow.fillStyle(0xffe8a3, 0.35);
    this.glow.fillTriangle(x, y + h, x + w, y + h, doorX + 60, H);
    this.glow.fillTriangle(x, y + h, doorX - 60, H, doorX + 60, H);

    // doors hinge on the frame: left leaf from its left edge, right leaf from its right edge
    this.leftDoor = this.add.image(x, y, 'door-leaf').setOrigin(0, 0).setScale(1 / R);
    this.rightDoor = this.add.image(x + w, y, 'door-leaf').setOrigin(1, 0).setScale(1 / R).setFlipX(true);

    this.player = this.add.sprite(doorX, H + 10, 'player', 'up0').setScale(PLAYER_SCALE / R).setDepth(10);

    // first load: fade in from black; coming back from the portfolio the tiles already hide the start
    if (!data.hold) this.cameras.main.fadeIn(500, 0, 0, 0);

    this.input.once('pointerdown', () => this.enter());
    this.input.keyboard.once('keydown', () => this.enter());

    if (!data.hold) this.begin();
  }

  begin() {
    if (this.started || this.done) return;
    this.started = true;
    const { y, h } = DOORWAY;
    const doorX = DOORWAY.x + DOORWAY.w / 2;

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
    this.tweens.add({ targets: [this.leftDoor, this.rightDoor], scaleX: 0.12 / R, duration: 800, delay: 250, ease: 'Cubic.inOut' });
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
      cam.zoomTo(5 * ZOOM, 1100, 'Sine.easeIn');
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

  addSunAndClouds() {
    const sun = this.add.image(278, 24, 'sun').setScale(1 / R);
    this.tweens.add({ targets: sun, angle: 360, duration: 24000, repeat: -1 });
    // clouds drift slowly to the right and wrap around
    for (const [cx, cy, s, speed] of [[40, 22, 1, 38000], [150, 12, 0.75, 52000], [215, 38, 0.6, 64000]]) {
      const cloud = this.add.image(cx, cy, 'cloud').setScale(s / R);
      const travel = (W + 60 - cx) / (W + 60);
      this.tweens.add({
        targets: cloud,
        x: W + 30,
        duration: speed * travel,
        onComplete: () => {
          cloud.x = -30;
          this.tweens.add({ targets: cloud, x: W + 30, duration: speed, repeat: -1, onRepeat: () => (cloud.x = -30) });
        },
      });
    }
  }

  addStars() {
    for (let i = 0; i < 40; i++) {
      const star = this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, 46), Phaser.Math.FloatBetween(0.4, 0.8), 0xffffff);
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

  addText(x, y, text, size, color, stroke) {
    return crispText(this, x, y, text, size, { color, stroke }).setOrigin(0.5).setDepth(5);
  }
}
