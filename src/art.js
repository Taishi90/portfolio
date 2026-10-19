// PLACEHOLDER pixel art, drawn in code so the game runs without any image files.
// To use real images (e.g. itch.io assets): put them in public/assets/,
// load them in RoomScene.preload() with the same keys ('player', 'obj-about', ...). Keys that already have an image are skipped here.

const PALETTE = {
  h: '#4a2f27', // hair
  s: '#f2c39b', // skin
  e: '#2b1d1d', // eyes
  t: '#3f7fd1', // shirt
  p: '#2e3a59', // pants
  b: '#1d1d1d', // shoes
};

const LEGS_STAND = ['....pppppppp....', '....ppp..ppp....', '....bbb..bbb....'];
const LEGS_STEP = ['....pppppppp....', '.....pp..pp.....', '.....bb..bb.....'];
const SIDE_STAND = ['.....pppppp.....', '.....pp..pp.....', '.....bb..bb.....'];
const SIDE_STEP = ['.....pppppp.....', '......pppp......', '......bbbb......'];

const HEAD_DOWN = [
  '................',
  '.....hhhhhh.....',
  '....hhhhhhhh....',
  '....hhhhhhhh....',
  '....hssssssh....',
  '....sesssses....',
  '....ssssssss....',
  '.....ssssss.....',
];
const HEAD_UP = [
  '................',
  '.....hhhhhh.....',
  '....hhhhhhhh....',
  '....hhhhhhhh....',
  '....hhhhhhhh....',
  '....hhhhhhhh....',
  '....shhhhhhs....',
  '.....ssssss.....',
];
const HEAD_SIDE = [
  '................',
  '.....hhhhhh.....',
  '....hhhhhhhh....',
  '....hhhhhhhh....',
  '....hhhsssss....',
  '....hhhsssse....',
  '....hhssssss....',
  '.....ssssss.....',
];
const BODY = ['....tttttttt....', '...stttttttts...', '...stttttttts...', '....tttttttt....'];
const BODY_SIDE = ['.....tttttt.....', '.....ttttts.....', '.....ttttts.....', '.....tttttt.....'];
const EMPTY = ['................'];

const PLAYER_FRAMES = {
  down0: [...HEAD_DOWN, ...BODY, ...LEGS_STAND, ...EMPTY],
  down1: [...HEAD_DOWN, ...BODY, ...LEGS_STEP, ...EMPTY],
  up0: [...HEAD_UP, ...BODY, ...LEGS_STAND, ...EMPTY],
  up1: [...HEAD_UP, ...BODY, ...LEGS_STEP, ...EMPTY],
  side0: [...HEAD_SIDE, ...BODY_SIDE, ...SIDE_STAND, ...EMPTY],
  side1: [...HEAD_SIDE, ...BODY_SIDE, ...SIDE_STEP, ...EMPTY],
};

function createPlayer(scene) {
  const names = Object.keys(PLAYER_FRAMES);
  const tex = scene.textures.createCanvas('player', 16 * names.length, 16);
  const ctx = tex.getContext();
  names.forEach((name, i) => {
    PLAYER_FRAMES[name].forEach((row, y) => {
      [...row].forEach((c, x) => {
        if (!PALETTE[c]) return;
        ctx.fillStyle = PALETTE[c];
        ctx.fillRect(i * 16 + x, y, 1, 1);
      });
    });
  });
  tex.refresh();
  names.forEach((name, i) => tex.add(name, 0, i * 16, 0, 16, 16));
}

// Draw a texture out of rectangles: draw(r) with r(color, x, y, w, h)
// If the key was already loaded from a real image (preload), keep it and do not draw over it
function makeTexture(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 }, false);
  draw((color, x, y, rw, rh) => {
    g.fillStyle(color);
    g.fillRect(x, y, rw, rh);
  });
  g.generateTexture(key, w, h);
  g.destroy();
}

function createObjects(scene) {
  // About: framed portrait on the wall
  makeTexture(scene, 'obj-about', 28, 24, (r) => {
    r(0xc9a227, 0, 0, 28, 24);
    r(0x8a6d12, 1, 1, 26, 22);
    r(0x9fd3e6, 3, 3, 22, 18);
    r(0x3f7fd1, 8, 14, 12, 7);
    r(0xf2c39b, 11, 7, 6, 6);
    r(0x4a2f27, 10, 5, 8, 3);
    r(0x4a2f27, 10, 7, 1, 3);
  });

  // Projects: desk + computer
  makeTexture(scene, 'obj-projects', 40, 32, (r) => {
    r(0x5c3a21, 3, 19, 3, 13);
    r(0x5c3a21, 34, 19, 3, 13);
    r(0x8a5a35, 0, 14, 40, 6);
    r(0x6b4426, 0, 19, 40, 1);
    r(0x222222, 8, 0, 24, 13);
    r(0x1b2b3a, 10, 2, 20, 9);
    r(0x7ee787, 11, 3, 8, 1);
    r(0x79c0ff, 13, 5, 10, 1);
    r(0xffa657, 13, 7, 6, 1);
    r(0x7ee787, 11, 9, 9, 1);
    r(0x222222, 18, 13, 4, 2);
    r(0xdddddd, 6, 15, 12, 2);
    r(0xaaaaaa, 26, 15, 4, 3);
  });

  // Skills: bookshelf
  makeTexture(scene, 'obj-skills', 24, 40, (r) => {
    r(0x5c3a21, 0, 0, 24, 40);
    r(0x3b2414, 2, 2, 20, 36);
    const books = [0xd64545, 0x3f7fd1, 0xffd23f, 0x4caf50, 0x9c6ade, 0xff8a3d];
    [2, 14, 26].forEach((top, shelf) => {
      let x = 3;
      for (let i = 0; x < 21; i++) {
        const w = 2 + ((i + shelf) % 2);
        const hgt = 7 + ((i * 3 + shelf) % 3);
        r(books[(i + shelf * 2) % books.length], x, top + 10 - hgt, w, hgt);
        x += w + 1;
      }
      r(0x5c3a21, 0, top + 10, 24, 2);
    });
  });

  // Contact: mailbox
  makeTexture(scene, 'obj-contact', 16, 28, (r) => {
    r(0x5c3a21, 6, 13, 4, 15);
    r(0xb83232, 1, 2, 14, 12);
    r(0xd64545, 1, 2, 14, 3);
    r(0x7a1f1f, 3, 7, 10, 5);
    r(0xffffff, 4, 8, 8, 3);
    r(0xffd23f, 14, 0, 2, 8);
    r(0xffd23f, 12, 0, 2, 3);
  });

  // Decoration: potted plant
  makeTexture(scene, 'deco-plant', 14, 22, (r) => {
    r(0x2e7d32, 2, 2, 10, 10);
    r(0x4caf50, 4, 0, 6, 8);
    r(0x66bb6a, 0, 6, 5, 5);
    r(0x66bb6a, 9, 5, 5, 5);
    r(0xb5651d, 3, 12, 8, 10);
    r(0x8d4a12, 3, 12, 8, 2);
  });

  // Bouncing "!" above each object
  makeTexture(scene, 'bang', 4, 9, (r) => {
    r(0x000000, 0, 0, 4, 9);
    r(0xffd23f, 1, 1, 2, 4);
    r(0xffd23f, 1, 6, 2, 2);
  });
}

export function createTextures(scene) {
  if (!scene.textures.exists('player')) createPlayer(scene);
  createObjects(scene);
}

// Red rug in the middle of the room (RoomScene shows a message when the player steps on it)
export const RUG = { x: 112, y: 118, w: 96, h: 60 };

// Draw the room background: wooden floor, walls, window, rug
export function drawRoom(scene, W, H, T, wallTop) {
  const g = scene.add.graphics();
  // floor
  g.fillStyle(0x8b5a3c);
  g.fillRect(0, 0, W, H);
  for (let y = wallTop; y < H; y += 8) {
    g.fillStyle(0x6e4430);
    g.fillRect(0, y + 7, W, 1);
    const shift = (y / 8) % 2 ? 0 : 24;
    for (let x = shift; x < W; x += 48) g.fillRect(x, y, 1, 7);
  }
  // top wall
  g.fillStyle(0x4b3a63);
  g.fillRect(0, 0, W, wallTop);
  g.fillStyle(0x5d4a7a);
  for (let x = 0; x < W; x += 8) g.fillRect(x, 0, 4, wallTop - 6);
  g.fillStyle(0x2f2340);
  g.fillRect(0, wallTop - 6, W, 6);
  // window
  g.fillStyle(0x2f2340);
  g.fillRect(138, 8, 44, 30);
  g.fillStyle(0x87ceeb);
  g.fillRect(141, 11, 38, 24);
  g.fillStyle(0xffffff);
  g.fillRect(146, 16, 10, 3);
  g.fillRect(150, 14, 6, 2);
  g.fillStyle(0x2f2340);
  g.fillRect(159, 11, 2, 24);
  g.fillRect(141, 22, 38, 2);
  // left/right/bottom walls
  g.fillStyle(0x2f2340);
  g.fillRect(0, 0, T, H);
  g.fillRect(W - T, 0, T, H);
  g.fillRect(0, H - T, W, T);
  g.fillStyle(0x3b2d52);
  g.fillRect(T - 3, wallTop, 3, H - wallTop - T);
  g.fillRect(W - T, wallTop, 3, H - wallTop - T);
  // rug
  const { x, y, w, h } = RUG;
  g.fillStyle(0x7a2e3a);
  g.fillRect(x, y, w, h);
  g.fillStyle(0xa8434f);
  g.fillRect(x + 4, y + 4, w - 8, h - 8);
  g.fillStyle(0xe0b04a);
  g.fillRect(x + 8, y + 8, w - 16, 1);
  g.fillRect(x + 8, y + h - 9, w - 16, 1);
  g.fillRect(x + 8, y + 8, 1, h - 16);
  g.fillRect(x + w - 9, y + 8, 1, h - 16);
  return g;
}
