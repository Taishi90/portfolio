import Phaser from 'phaser';
import { createTextures, drawRoom, RUG } from '../art.js';
import { touch } from '../touch.js';
import { SECTIONS } from '../content.js';
import { showPanel, hidePanel } from '../ui.js';

const W = 320;
const H = 240;
const T = 16;
const WALL_TOP = 48;
const SPEED = 80;

// The 4 objects. x, y = bottom-center of the image.
// solid: collision area (cannot walk through).
// zone: [x, y, w, h] trigger area around the object: walking near it opens its panel, no exact spot needed.
// Zones must not overlap each other or the rug.
const OBJECTS = [
  { id: 'about', key: 'obj-about', x: 72, y: 40, solid: null, zone: [47, 48, 50, 25] },
  { id: 'projects', key: 'obj-projects', x: 248, y: 80, solid: [228, 48, 40, 30], zone: [220, 48, 57, 42] },
  { id: 'skills', key: 'obj-skills', x: 28, y: 168, solid: [16, 146, 24, 22], zone: [16, 122, 42, 53] },
  { id: 'contact', key: 'obj-contact', x: 288, y: 204, solid: [282, 192, 12, 12], zone: [265, 168, 39, 45] },
];

export default class RoomScene extends Phaser.Scene {
  constructor() {
    super('Room');
  }

  create() {
    createTextures(this);
    drawRoom(this, W, H, T, WALL_TOP);

    this.walls = this.physics.add.staticGroup();
    const solid = (x, y, w, h) => {
      const r = this.add.rectangle(x + w / 2, y + h / 2, w, h);
      this.physics.add.existing(r, true);
      this.walls.add(r);
    };
    solid(0, 0, W, WALL_TOP);
    solid(0, 0, T, H);
    solid(W - T, 0, T, H);
    solid(0, H - T, W, T);

    this.add.image(300, 66, 'deco-plant').setOrigin(0.5, 1).setDepth(66);
    solid(294, 56, 12, 10);

    this.spots = OBJECTS.map((o) => {
      const section = SECTIONS.find((s) => s.id === o.id);
      const img = this.add.image(o.x, o.y, o.key).setOrigin(0.5, 1).setDepth(o.y);
      if (o.solid) solid(...o.solid);
      const top = o.y - img.height;
      const bang = this.add.image(o.x, top - 4, 'bang').setOrigin(0.5, 1).setDepth(1000);
      this.tweens.add({ targets: bang, y: top - 8, duration: 500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      const label = this.add
        .text(o.x, o.y + 2, section.title, {
          fontFamily: 'system-ui, sans-serif',
          fontSize: '24px',
          color: '#ffffff',
          stroke: '#1a1423',
          strokeThickness: 6,
        })
        .setOrigin(0.5, 0)
        .setScale(1 / 3)
        .setDepth(o.y + 1); // the player in front of a label covers it
      // text is drawn large then scaled down with smooth filtering, so it is not jagged like the pixel art
      label.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
      // the picture hangs on the wall: put its label at the foot of the wall so it is readable
      if (o.id === 'about') label.setY(WALL_TOP + 1);
      return { ...o, section, zone: new Phaser.Geom.Rectangle(...o.zone), bang, label };
    });

    // Message inside the rug, fades in while the player stands on it
    this.rugZone = new Phaser.Geom.Rectangle(RUG.x, RUG.y, RUG.w, RUG.h);
    this.rugText = this.add
      .text(RUG.x + RUG.w / 2, RUG.y + RUG.h / 2, 'From Pixel\nTo Picture', {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '30px',
        fontStyle: 'bold',
        color: '#ffe8a3',
        align: 'center',
        stroke: '#5a1f29',
        strokeThickness: 6,
        lineSpacing: -4,
      })
      .setOrigin(0.5)
      .setScale(1 / 3)
      .setDepth(1) // on the floor: the player walks over it
      .setAlpha(0);
    this.rugText.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
    // The player spawns on the rug: count that as already on it, so the text only shows after leaving and coming back
    this.onRug = true;

    this.player = this.physics.add.sprite(160, 150, 'player', 'down0');
    this.player.body.setSize(10, 6).setOffset(3, 10);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.walls);
    this.facing = 'down';

    for (const dir of ['down', 'up', 'side']) {
      this.anims.create({
        key: `walk-${dir}`,
        frames: [{ key: 'player', frame: `${dir}1` }, { key: 'player', frame: `${dir}0` }],
        frameRate: 6,
        repeat: -1,
      });
    }

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');

    // The panel only opens when entering a new zone, so closing it with × keeps it closed until the next visit
    this.activeId = null;
  }

  update() {
    const k = this.cursors;
    const left = k.left.isDown || this.wasd.A.isDown || touch.left;
    const right = k.right.isDown || this.wasd.D.isDown || touch.right;
    const up = k.up.isDown || this.wasd.W.isDown || touch.up;
    const down = k.down.isDown || this.wasd.S.isDown || touch.down;

    const v = new Phaser.Math.Vector2((right ? 1 : 0) - (left ? 1 : 0), (down ? 1 : 0) - (up ? 1 : 0));
    v.normalize().scale(SPEED);
    this.player.setVelocity(v.x, v.y);

    if (v.lengthSq() > 0) {
      if (Math.abs(v.x) > Math.abs(v.y)) this.facing = v.x < 0 ? 'left' : 'right';
      else this.facing = v.y < 0 ? 'up' : 'down';
      const anim = this.facing === 'left' || this.facing === 'right' ? 'side' : this.facing;
      this.player.setFlipX(this.facing === 'left');
      this.player.anims.play(`walk-${anim}`, true);
    } else {
      this.player.anims.stop();
      const frame = this.facing === 'left' || this.facing === 'right' ? 'side' : this.facing;
      this.player.setFrame(`${frame}0`);
    }
    this.player.setDepth(this.player.y + 8);

    this.checkSpots();
    this.checkRug();
  }

  checkRug() {
    const { x, y } = this.player.body.center;
    const onRug = this.rugZone.contains(x, y);
    if (onRug === this.onRug) return;
    this.onRug = onRug;
    this.tweens.killTweensOf(this.rugText);
    this.tweens.add({ targets: this.rugText, alpha: onRug ? 1 : 0, duration: 300 });
  }

  checkSpots() {
    const { x, y } = this.player.body.center;
    const spot = this.spots.find((s) => s.zone.contains(x, y));
    const id = spot ? spot.id : null;
    if (id === this.activeId) return;

    this.activeId = id;
    if (spot) showPanel(spot.section);
    else hidePanel();
  }
}
