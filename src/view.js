// The game world is a small 320x240 pixel-art room, but the canvas is drawn ZOOM times bigger
// (close to the real screen size) and every camera zooms in by ZOOM. Pixel art stays crisp
// (pixelArt: true) and text is rasterized at its real on-screen size, so it is sharp and readable.
import Phaser from 'phaser';

export const WORLD_W = 320;
export const WORLD_H = 240;
export const ZOOM = Phaser.Math.Clamp(
  Math.ceil(Math.min(window.innerWidth / WORLD_W, window.innerHeight / WORLD_H) * (window.devicePixelRatio || 1)),
  2,
  6,
);

// Readable, rounded font for all in-game text (loaded in index.html, falls back to the system font)
export const FONT = '"Nunito", system-ui, -apple-system, "Segoe UI", sans-serif';

// Point a scene's main camera at the 320x240 world
export function setupCamera(scene) {
  scene.cameras.main.setZoom(ZOOM).centerOn(WORLD_W / 2, WORLD_H / 2);
}

// In-game text. size / stroke / lineSpacing are in world pixels (1 world px = ZOOM screen px).
export function crispText(scene, x, y, text, size, { color = '#ffffff', stroke = 0, strokeColor = '#1c2541', lineSpacing = 0, align = 'center' } = {}) {
  const t = scene.add
    .text(x, y, text, {
      fontFamily: FONT,
      fontStyle: '800',
      fontSize: `${Math.round(size * ZOOM)}px`,
      color,
      stroke: strokeColor,
      strokeThickness: stroke * ZOOM,
      lineSpacing: lineSpacing * ZOOM,
      align,
    })
    .setScale(1 / ZOOM);
  // pixelArt: true makes every texture NEAREST-filtered; text needs smooth filtering
  t.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
  return t;
}
