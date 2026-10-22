// Game art in a bright "casual mobile game" style (chunky shapes, thick navy outlines, glossy highlights,
// soft drop shadows, saturated colors), drawn in code with Canvas 2D so the game needs no image files.
//
// Every texture is drawn R times bigger than its size in the 320x240 world and displayed with setScale(1 / R),
// so it stays sharp on the high-res canvas. Physics sizes/offsets of scaled sprites are in TEXTURE pixels (× R).
//
// To use real images instead: load them in a scene's preload() with the same keys ('player', 'obj-about', ...);
// keys that already exist are skipped here. Real images should also be R× the world size (or adjust the scale).
import { ZOOM } from './view.js';

export const R = ZOOM; // texture pixels per world pixel

const INK = '#1c2541'; // outline color
const LW = 0.9; // outline width (world px)

// ---------- drawing helpers (all in world units) ----------

function canvasTexture(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return scene.textures.get(key);
  const tex = scene.textures.createCanvas(key, Math.ceil(w * R), Math.ceil(h * R));
  const ctx = tex.getContext();
  ctx.save();
  ctx.scale(R, R);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  draw(ctx);
  ctx.restore();
  tex.refresh();
  return tex;
}

function vgrad(ctx, y0, y1, top, bottom) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  return g;
}

// A chunky shape: vertical gradient fill, glossy highlight on top, darker band at the bottom, thick outline.
// path() must build the shape path; [x, y, w, h] is its bounding box.
function blob(ctx, path, [x, y, w, h], { top, bottom = top, gloss = 0.32, shade = 0.12, lw = LW, ink = INK } = {}) {
  path();
  ctx.fillStyle = vgrad(ctx, y, y + h, top, bottom);
  ctx.fill();
  if (gloss || shade) {
    ctx.save();
    path();
    ctx.clip();
    if (shade) {
      ctx.fillStyle = `rgba(0, 0, 0, ${shade})`;
      ctx.fillRect(x - 1, y + h * 0.78, w + 2, h);
    }
    if (gloss) {
      ctx.fillStyle = `rgba(255, 255, 255, ${gloss})`;
      ctx.beginPath();
      ctx.roundRect(x + w * 0.12, y + h * 0.07, w * 0.76, Math.max(0.6, h * 0.28), Math.min(w, h) * 0.18);
      ctx.fill();
    }
    ctx.restore();
  }
  if (lw) {
    path();
    ctx.lineWidth = lw;
    ctx.strokeStyle = ink;
    ctx.stroke();
  }
}

function box(ctx, x, y, w, h, r, opts) {
  blob(ctx, () => { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }, [x, y, w, h], opts);
}

function ball(ctx, cx, cy, r, opts) {
  blob(ctx, () => { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); }, [cx - r, cy - r, r * 2, r * 2], opts);
}

function ellipse(ctx, cx, cy, rx, ry, color, rot = 0) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function shadow(ctx, cx, cy, rx, ry = rx * 0.28) {
  ellipse(ctx, cx, cy, rx, ry, 'rgba(20, 24, 60, 0.25)');
}

// ---------- player: chibi character, 6 frames of 16x16 ----------

const SKIN = ['#ffe0c2', '#f5b98f'];
const HAIR = ['#7a4a2e', '#4a2a1c'];
const SHIRT = ['#5fb2ff', '#2f6fe0'];
const PANTS = '#2b2f55';

function drawPlayer(ctx, dir, step) {
  const bob = step ? -0.45 : 0;
  shadow(ctx, 8, 15.1, 4.6, 1.2);

  // feet
  const feet =
    dir === 'side'
      ? [[6.2 + (step ? -1 : 0), 13.3], [8.6 + (step ? 1 : 0), 13.3]]
      : [[5.1, 13.3 - (step ? 0.7 : 0)], [8.3, 13.3]];
  for (const [fx, fy] of feet) box(ctx, fx, fy, 2.6, 1.8, 0.9, { top: PANTS, gloss: 0.15, shade: 0, lw: 0.7 });

  ctx.save();
  ctx.translate(0, bob);
  // arms + body
  if (dir !== 'side') {
    ball(ctx, 4.4, 11.8, 1.1, { top: SKIN[0], bottom: SKIN[1], gloss: 0.2, lw: 0.7 });
    ball(ctx, 11.6, 11.8, 1.1, { top: SKIN[0], bottom: SKIN[1], gloss: 0.2, lw: 0.7 });
    box(ctx, 4.8, 9.6, 6.4, 4.4, 2, { top: SHIRT[0], bottom: SHIRT[1], lw: 0.8 });
  } else {
    box(ctx, 5.6, 9.6, 5, 4.4, 2, { top: SHIRT[0], bottom: SHIRT[1], lw: 0.8 });
    ball(ctx, 8.4, 11.9, 1.1, { top: SKIN[0], bottom: SKIN[1], gloss: 0.2, lw: 0.7 });
  }

  // head
  const cx = 8;
  const cy = 5.8;
  const r = 4.9;
  ball(ctx, cx, cy, r, { top: SKIN[0], bottom: SKIN[1], gloss: 0, shade: 0, lw: 0.9 });

  // hair
  const hairOpts = { top: HAIR[0], bottom: HAIR[1], gloss: 0.24, shade: 0, lw: 0.9 };
  if (dir === 'up') {
    // back of the head: hair covers everything but the neck
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, 16, cy + 3.3);
    ctx.clip();
    ball(ctx, cx, cy - 0.1, r + 0.25, hairOpts);
    ctx.restore();
  } else if (dir === 'down') {
    const path = () => {
      ctx.beginPath();
      ctx.arc(cx, cy - 0.2, r + 0.3, Math.PI * 1.02, Math.PI * 1.98);
      ctx.quadraticCurveTo(cx + r - 0.2, cy + 1.6, cx + 2.6, cy - 0.4);
      ctx.quadraticCurveTo(cx + 1, cy + 0.6, cx - 0.4, cy - 0.6);
      ctx.quadraticCurveTo(cx - 2.2, cy + 0.8, cx - r - 0.1, cy + 1.2);
      ctx.closePath();
    };
    blob(ctx, path, [cx - r, cy - r, r * 2, r * 1.4], hairOpts);
  } else {
    // side (facing right): hair covers the back and the top, short fringe at the front
    const path = () => {
      ctx.beginPath();
      ctx.arc(cx, cy - 0.2, r + 0.3, Math.PI * 0.62, Math.PI * 1.9);
      ctx.quadraticCurveTo(cx + 3.4, cy - 0.6, cx + 0.6, cy - 0.4);
      ctx.quadraticCurveTo(cx - 0.6, cy + 1.2, cx - 1.2, cy + 3.2);
      ctx.closePath();
    };
    blob(ctx, path, [cx - r, cy - r, r * 2, r * 1.8], hairOpts);
  }

  // face
  const eye = (ex) => {
    ellipse(ctx, ex, cy + 1.5, 0.8, 1.1, INK);
    ellipse(ctx, ex + 0.25, cy + 1.05, 0.3, 0.35, '#ffffff');
  };
  if (dir === 'down') {
    eye(cx - 1.8);
    eye(cx + 1.8);
    ellipse(ctx, cx - 3, cy + 2.9, 0.9, 0.5, 'rgba(255, 110, 130, 0.45)');
    ellipse(ctx, cx + 3, cy + 2.9, 0.9, 0.5, 'rgba(255, 110, 130, 0.45)');
    ctx.beginPath();
    ctx.arc(cx, cy + 2.6, 0.7, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.lineWidth = 0.45;
    ctx.strokeStyle = INK;
    ctx.stroke();
  } else if (dir === 'side') {
    eye(cx + 2.7);
    ellipse(ctx, cx + 3.2, cy + 2.9, 0.8, 0.45, 'rgba(255, 110, 130, 0.45)');
  }
  ctx.restore();
}

function createPlayer(scene) {
  if (scene.textures.exists('player')) return;
  const frames = [['down0', 'down', 0], ['down1', 'down', 1], ['up0', 'up', 0], ['up1', 'up', 1], ['side0', 'side', 0], ['side1', 'side', 1]];
  const tex = canvasTexture(scene, 'player', 16 * frames.length, 16, (ctx) => {
    frames.forEach(([, dir, step], i) => {
      ctx.save();
      ctx.translate(i * 16, 0);
      drawPlayer(ctx, dir, step);
      ctx.restore();
    });
  });
  frames.forEach(([name], i) => tex.add(name, 0, i * 16 * R, 0, 16 * R, 16 * R));
}

// Walk animations 'walk-down' / 'walk-up' / 'walk-side' (animations are global, so create them once)
function createPlayerAnims(scene) {
  for (const dir of ['down', 'up', 'side']) {
    if (scene.anims.exists(`walk-${dir}`)) continue;
    scene.anims.create({
      key: `walk-${dir}`,
      frames: [{ key: 'player', frame: `${dir}1` }, { key: 'player', frame: `${dir}0` }],
      frameRate: 6,
      repeat: -1,
    });
  }
}

// ---------- the 4 objects + decorations ----------

const BOOKS = [['#ff7a8a', '#e5435f'], ['#6bb8ff', '#2f74d6'], ['#ffe066', '#ffb020'], ['#7be35a', '#3fa83a'], ['#c39bff', '#8a5cf0'], ['#ffb36b', '#f07a2a']];

function createObjects(scene) {
  // About: golden picture frame with a portrait
  canvasTexture(scene, 'obj-about', 28, 24, (ctx) => {
    box(ctx, 0.6, 0.6, 26.8, 22.8, 4, { top: '#ffe680', bottom: '#f5a524' });
    box(ctx, 3.6, 3.6, 20.8, 16.8, 2.5, { top: '#a8e2ff', bottom: '#5aa9f0', gloss: 0, shade: 0, lw: 0.7 });
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(3.6, 3.6, 20.8, 16.8, 2.5);
    ctx.clip();
    box(ctx, 8.5, 15, 11, 7, 3.5, { top: SHIRT[0], bottom: SHIRT[1], lw: 0.7 });
    ball(ctx, 14, 10.6, 4, { top: SKIN[0], bottom: SKIN[1], gloss: 0, shade: 0, lw: 0.7 });
    blob(
      ctx,
      () => {
        ctx.beginPath();
        ctx.arc(14, 10.3, 4.3, Math.PI, Math.PI * 2);
        ctx.quadraticCurveTo(15.5, 10, 13.6, 9.2);
        ctx.quadraticCurveTo(12, 10.8, 9.7, 10.8);
        ctx.closePath();
      },
      [9.7, 6, 8.6, 5],
      { top: HAIR[0], bottom: HAIR[1], gloss: 0.2, shade: 0, lw: 0.7 },
    );
    ellipse(ctx, 12.6, 11.7, 0.6, 0.8, INK);
    ellipse(ctx, 15.4, 11.7, 0.6, 0.8, INK);
    ctx.restore();
    // sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(23.5, 1.5);
    ctx.quadraticCurveTo(24, 3.4, 25.8, 3.8);
    ctx.quadraticCurveTo(24, 4.2, 23.5, 6);
    ctx.quadraticCurveTo(23, 4.2, 21.2, 3.8);
    ctx.quadraticCurveTo(23, 3.4, 23.5, 1.5);
    ctx.fill();
  });

  // Projects: desk with a glowing monitor
  canvasTexture(scene, 'obj-projects', 40, 32, (ctx) => {
    shadow(ctx, 20, 30.6, 18, 1.4);
    box(ctx, 3, 18, 3.6, 12.6, 1.4, { top: '#d9844a', bottom: '#a8552a', gloss: 0.15 });
    box(ctx, 33.4, 18, 3.6, 12.6, 1.4, { top: '#d9844a', bottom: '#a8552a', gloss: 0.15 });
    box(ctx, 0.6, 14, 38.8, 6, 2.6, { top: '#ffbe6b', bottom: '#e8893a' });
    box(ctx, 17.8, 10.5, 4.4, 4.5, 1, { top: '#5b6a9e', bottom: '#3b4a7a', gloss: 0.15 });
    box(ctx, 7, 0.6, 26, 12.4, 2.6, { top: '#3a4680', bottom: '#222b55' });
    box(ctx, 9, 2.4, 22, 8.6, 1.6, { top: '#3ff0d8', bottom: '#139ec8', gloss: 0.25, shade: 0, lw: 0.6 });
    const lines = [[10.5, 4, 8, '#ffffff'], [12.5, 5.8, 10, '#ffe066'], [12.5, 7.6, 6, '#ff8fc0'], [10.5, 9.2, 9, '#ffffff']];
    for (const [lx, ly, lw, c] of lines) {
      ctx.beginPath();
      ctx.roundRect(lx, ly, lw, 0.9, 0.45);
      ctx.fillStyle = c;
      ctx.fill();
    }
    box(ctx, 7, 15, 12, 2.6, 1.1, { top: '#ffffff', bottom: '#d6dcf0', gloss: 0, shade: 0, lw: 0.6 });
    box(ctx, 27, 12, 4.2, 4.2, 1.2, { top: '#ff7a8a', bottom: '#e5435f', lw: 0.7 });
    ctx.beginPath();
    ctx.arc(31.6, 14.1, 1.1, -Math.PI / 2, Math.PI / 2);
    ctx.lineWidth = 0.7;
    ctx.strokeStyle = INK;
    ctx.stroke();
  });

  // Skills: bookshelf with colorful books
  canvasTexture(scene, 'obj-skills', 24, 40, (ctx) => {
    box(ctx, 0.6, 0.6, 22.8, 38.8, 3, { top: '#e8925a', bottom: '#b8612f', gloss: 0.18 });
    box(ctx, 2.6, 2.6, 18.8, 34.8, 1.6, { top: '#7a3f22', bottom: '#5a2c16', gloss: 0, shade: 0, lw: 0.6 });
    [2.8, 14.6, 26.4].forEach((top, shelf) => {
      let x = 3.4;
      for (let i = 0; x < 19.5; i++) {
        const w = 2.4 + ((i + shelf) % 2) * 0.8;
        const h = 7.4 + ((i * 2 + shelf) % 3) * 1.1;
        const [c0, c1] = BOOKS[(i + shelf * 2) % BOOKS.length];
        box(ctx, x, top + 9.8 - h, w, h, 0.8, { top: c0, bottom: c1, gloss: 0.3, shade: 0, lw: 0.55 });
        x += w + 0.5;
      }
      box(ctx, 1.6, top + 9.6, 20.8, 2.2, 1, { top: '#ffbe6b', bottom: '#e8893a', gloss: 0.2, shade: 0, lw: 0.6 });
    });
  });

  // Contact: red mailbox with a letter and a yellow flag
  canvasTexture(scene, 'obj-contact', 16, 28, (ctx) => {
    shadow(ctx, 8, 27, 5, 1.1);
    box(ctx, 6.3, 12.5, 3.4, 14.4, 1.2, { top: '#d9844a', bottom: '#a8552a', gloss: 0.15 });
    box(ctx, 13.2, 0.6, 1.3, 7.5, 0.6, { top: '#5b6a9e', bottom: '#3b4a7a', gloss: 0, shade: 0, lw: 0.5 });
    box(ctx, 9.4, 0.6, 4.2, 3, 0.8, { top: '#ffe066', bottom: '#ffb020', lw: 0.6 });
    blob(ctx, () => { ctx.beginPath(); ctx.roundRect(1, 2.6, 13.4, 11, [6, 6, 2, 2]); }, [1, 2.6, 13.4, 11], { top: '#ff7a7a', bottom: '#e03a4a' });
    box(ctx, 3, 7.4, 9.4, 4.2, 1.6, { top: '#a8243a', bottom: '#7a1a2a', gloss: 0, shade: 0, lw: 0.6 });
    box(ctx, 4.4, 5.8, 6.6, 3.6, 0.6, { top: '#ffffff', bottom: '#e6ebf7', gloss: 0, shade: 0, lw: 0.5 });
    ctx.beginPath();
    ctx.moveTo(4.6, 6);
    ctx.lineTo(7.7, 8);
    ctx.lineTo(10.8, 6);
    ctx.lineWidth = 0.4;
    ctx.strokeStyle = INK;
    ctx.stroke();
  });

  // Decoration: potted plant
  canvasTexture(scene, 'deco-plant', 14, 22, (ctx) => {
    shadow(ctx, 7, 21.2, 5, 1);
    const leaf = (cx, cy, rx, ry, rot) =>
      blob(ctx, () => { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, rot, 0, Math.PI * 2); }, [cx - rx, cy - ry, rx * 2, ry * 2], {
        top: '#8ef06a',
        bottom: '#3fa83a',
        gloss: 0.25,
        shade: 0,
        lw: 0.7,
      });
    leaf(4, 8, 2.2, 4.2, -0.6);
    leaf(10, 8, 2.2, 4.2, 0.6);
    leaf(7, 5.6, 2.4, 5, 0);
    box(ctx, 2.6, 12, 8.8, 9.4, [1.5, 1.5, 3, 3], { top: '#ffb36b', bottom: '#e8742a' });
    box(ctx, 1.8, 11.2, 10.4, 2.8, 1.3, { top: '#ffc98a', bottom: '#f08a3a', gloss: 0.2, shade: 0, lw: 0.7 });
  });

  // Yellow "!" badge bouncing above each object
  canvasTexture(scene, 'bang', 10, 12, (ctx) => {
    ctx.beginPath();
    ctx.moveTo(3.4, 8.4);
    ctx.lineTo(5, 11.4);
    ctx.lineTo(6.6, 8.4);
    ctx.closePath();
    ctx.fillStyle = '#ffb020';
    ctx.fill();
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = INK;
    ctx.stroke();
    ball(ctx, 5, 5, 4.5, { top: '#fff08a', bottom: '#ffb020', gloss: 0.4, shade: 0, lw: 0.9 });
    box(ctx, 4.3, 2.1, 1.4, 3.8, 0.7, { top: INK, gloss: 0, shade: 0, lw: 0 });
    ellipse(ctx, 5, 7.4, 0.8, 0.8, INK);
  });
}

// ---------- intro: door, lamps, house front ----------

// Intro: the door opening is (128, 92) to (192, 188)
export const DOORWAY = { x: 128, y: 92, w: 64, h: 96 };

function createDoor(scene) {
  // one leaf of the double door; the right leaf is the same image flipped
  canvasTexture(scene, 'door-leaf', 32, 96, (ctx) => {
    blob(ctx, () => { ctx.beginPath(); ctx.roundRect(0.5, 0.5, 31, 95, [8, 0, 0, 0]); }, [0.5, 0.5, 31, 95], {
      top: '#ffa866',
      bottom: '#d9622f',
      gloss: 0.18,
      shade: 0.08,
    });
    box(ctx, 5, 8, 20, 34, [6, 3, 3, 3], { top: '#e8803f', bottom: '#c45526', gloss: 0.15, shade: 0, lw: 0.7 });
    box(ctx, 5, 50, 20, 38, 3, { top: '#e8803f', bottom: '#c45526', gloss: 0.15, shade: 0, lw: 0.7 });
    ball(ctx, 27, 47, 1.9, { top: '#ffe680', bottom: '#f5a524', gloss: 0.4, shade: 0, lw: 0.7 });
  });

  canvasTexture(scene, 'lamp', 10, 14, (ctx) => {
    box(ctx, 3, 0.4, 4, 2, 0.8, { top: '#5b6a9e', bottom: '#3b4a7a', gloss: 0, shade: 0, lw: 0.6 });
    box(ctx, 1.2, 2, 7.6, 10, 3, { top: '#fff6c8', bottom: '#ffc94a', gloss: 0.45, shade: 0, lw: 0.8 });
    box(ctx, 3, 12, 4, 1.6, 0.6, { top: '#5b6a9e', bottom: '#3b4a7a', gloss: 0, shade: 0, lw: 0.6 });
  });
}

export function drawFacade(scene, W, H) {
  const { x, y, w, h } = DOORWAY;
  canvasTexture(scene, 'facade', W, H, (ctx) => {
    // night sky + moon
    ctx.fillStyle = vgrad(ctx, 0, 200, '#1d2a6e', '#5a3f92');
    ctx.fillRect(0, 0, W, H);
    ellipse(ctx, 278, 22, 18, 18, 'rgba(255, 246, 200, 0.12)');
    ball(ctx, 278, 22, 9, { top: '#fffbe0', bottom: '#ffe28a', gloss: 0, shade: 0, lw: 0 });
    ellipse(ctx, 275, 20, 1.6, 1.6, 'rgba(230, 200, 120, 0.6)');
    ellipse(ctx, 281, 25, 1.1, 1.1, 'rgba(230, 200, 120, 0.6)');

    // grass
    blob(ctx, () => { ctx.beginPath(); ctx.roundRect(-4, 196, W + 8, 60, 8); }, [-4, 196, W + 8, 60], { top: '#6fdc4a', bottom: '#3a9a36', gloss: 0.12, shade: 0 });

    // house wall with siding
    blob(ctx, () => { ctx.beginPath(); ctx.roundRect(24, 56, W - 48, 146, 4); }, [24, 56, W - 48, 146], { top: '#5fb2ff', bottom: '#2f6fd6', gloss: 0, shade: 0.08 });
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let sy = 66; sy < 200; sy += 11) ctx.fillRect(25, sy, W - 50, 1.2);

    // roof
    box(ctx, 14, 44, W - 28, 17, 7, { top: '#ff7a7a', bottom: '#d93d4f', gloss: 0.3 });

    // lit windows on both sides
    for (const wx of [48, 234]) {
      box(ctx, wx - 3, 97, 44, 38, 5, { top: '#ffffff', bottom: '#d9e2ff', gloss: 0, shade: 0.06 });
      box(ctx, wx, 100, 38, 32, 3, { top: '#fff2b8', bottom: '#ffc24a', gloss: 0.3, shade: 0, lw: 0.7 });
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(wx + 18, 100.5, 2, 31);
      ctx.fillRect(wx + 0.5, 115, 37, 2);
      box(ctx, wx - 5, 133, 48, 4, 1.6, { top: '#ffffff', bottom: '#d9e2ff', gloss: 0, shade: 0, lw: 0.7 });
    }

    // path + steps
    ctx.beginPath();
    ctx.moveTo(x + 6, y + h + 12);
    ctx.lineTo(x + w - 6, y + h + 12);
    ctx.lineTo(x + w + 22, H + 2);
    ctx.lineTo(x - 22, H + 2);
    ctx.closePath();
    ctx.fillStyle = vgrad(ctx, y + h, H, '#f3cf9a', '#d9a868');
    ctx.fill();
    ctx.lineWidth = LW;
    ctx.strokeStyle = INK;
    ctx.stroke();
    box(ctx, x - 16, y + h + 5, w + 32, 7, 2.5, { top: '#d4dcf0', bottom: '#9aa8c8', gloss: 0.3 });
    box(ctx, x - 11, y + h - 1, w + 22, 7, 2.5, { top: '#e4eaf8', bottom: '#aab6d4', gloss: 0.3 });

    // door frame + warm light inside (hidden behind the closed doors)
    blob(ctx, () => { ctx.beginPath(); ctx.roundRect(x - 7, y - 9, w + 14, h + 9, [14, 14, 0, 0]); }, [x - 7, y - 9, w + 14, h + 9], {
      top: '#b8612f',
      bottom: '#8a4220',
      gloss: 0.15,
      shade: 0,
    });
    blob(ctx, () => { ctx.beginPath(); ctx.roundRect(x, y, w, h, [8, 8, 0, 0]); }, [x, y, w, h], { top: '#fffbe8', bottom: '#ffd98a', gloss: 0, shade: 0, lw: 0.7 });

    // sign plaque (WELCOME text is added by the scene)
    box(ctx, x + 4, y - 27, w - 8, 15, 5, { top: '#ffe680', bottom: '#ffb020', gloss: 0.35 });

    // bushes
    for (const [bx, by] of [[38, 198], [282, 198]]) {
      ball(ctx, bx - 9, by, 8, { top: '#8ef06a', bottom: '#3fa83a', gloss: 0.25, shade: 0 });
      ball(ctx, bx + 9, by, 8, { top: '#8ef06a', bottom: '#3fa83a', gloss: 0.25, shade: 0 });
      ball(ctx, bx, by - 5, 10, { top: '#8ef06a', bottom: '#3fa83a', gloss: 0.25, shade: 0 });
    }
  });
  return scene.add.image(0, 0, 'facade').setOrigin(0).setScale(1 / R);
}

// ---------- room ----------

// Red rug in the middle of the room (RoomScene shows a message when the player steps on it)
export const RUG = { x: 112, y: 118, w: 96, h: 60 };

export function drawRoom(scene, W, H, T, wallTop) {
  canvasTexture(scene, 'room-bg', W, H, (ctx) => {
    // wooden floor with staggered planks
    ctx.fillStyle = '#f2b66b';
    ctx.fillRect(0, 0, W, H);
    for (let py = wallTop, row = 0; py < H; py += 10, row++) {
      ctx.fillStyle = row % 2 ? '#f6c27a' : '#f0b56b';
      ctx.fillRect(0, py, W, 10);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(0, py + 0.6, W, 1);
      ctx.fillStyle = 'rgba(150, 80, 30, 0.35)';
      ctx.fillRect(0, py + 9.4, W, 0.6);
      for (let px = row % 2 ? 22 : 54; px < W; px += 64) ctx.fillRect(px, py, 0.6, 10);
    }
    // soft shadow under the back wall
    ctx.fillStyle = vgrad(ctx, wallTop, wallTop + 16, 'rgba(30, 20, 60, 0.28)', 'rgba(30, 20, 60, 0)');
    ctx.fillRect(0, wallTop, W, 16);

    // back wall: blue with soft stripes, wainscot and baseboard
    ctx.fillStyle = vgrad(ctx, 0, wallTop, '#6bb8ff', '#3f86e8');
    ctx.fillRect(0, 0, W, wallTop);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    for (let sx = 0; sx < W; sx += 12) ctx.fillRect(sx, 0, 6, wallTop - 12);
    ctx.fillStyle = vgrad(ctx, wallTop - 12, wallTop, '#3a74d6', '#2a5cb8');
    ctx.fillRect(0, wallTop - 12, W, 12);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(0, wallTop - 12.5, W, 1.4);
    ctx.fillStyle = '#21408a';
    ctx.fillRect(0, wallTop - 3, W, 3);

    // window
    box(ctx, 137, 6, 46, 32, 5, { top: '#ffffff', bottom: '#d9e2ff', gloss: 0, shade: 0.06 });
    box(ctx, 140.5, 9.5, 39, 25, 3, { top: '#aef0ff', bottom: '#4fb3ff', gloss: 0, shade: 0, lw: 0.7 });
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(140.5, 9.5, 39, 25, 3);
    ctx.clip();
    for (const [cx, cy, r] of [[150, 18, 3.4], [154.5, 16.5, 4.2], [159, 18.4, 3]]) ellipse(ctx, cx, cy, r, r, '#ffffff');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(147, 18.4, 15, 3);
    ctx.restore();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(159, 10, 2, 24);
    ctx.fillRect(141, 21, 38, 2);
    box(ctx, 134, 36, 52, 4, 1.8, { top: '#ffffff', bottom: '#d9e2ff', gloss: 0, shade: 0, lw: 0.7 });

    // side and bottom walls
    ctx.fillStyle = vgrad(ctx, 0, H, '#2b3f80', '#1e2c60');
    ctx.fillRect(0, 0, T, H);
    ctx.fillRect(W - T, 0, T, H);
    ctx.fillRect(0, H - T, W, T);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fillRect(T - 2, wallTop, 2, H - wallTop - T);
    ctx.fillRect(W - T, wallTop, 2, H - wallTop - T);
    // outline around the open room
    ctx.beginPath();
    ctx.roundRect(T, 0, W - 2 * T, H - T, [0, 0, 5, 5]);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = INK;
    ctx.stroke();

    // rug
    const { x, y, w, h } = RUG;
    shadow(ctx, x + w / 2, y + h - 1, w / 2, 3);
    box(ctx, x, y, w, h, 9, { top: '#ff7a8a', bottom: '#e5435f', gloss: 0.12, shade: 0.06 });
    ctx.beginPath();
    ctx.roundRect(x + 5, y + 5, w - 10, h - 10, 6);
    ctx.setLineDash([2.2, 1.6]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#ffe066';
    ctx.stroke();
    ctx.setLineDash([]);
  });
  return scene.add.image(0, 0, 'room-bg').setOrigin(0).setScale(1 / R);
}

export function createTextures(scene) {
  createPlayer(scene);
  createObjects(scene);
  createDoor(scene);
  createPlayerAnims(scene);
}
