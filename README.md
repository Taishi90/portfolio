# Pixel Portfolio

A portfolio as a 2D pixel art game (Phaser 3 + Vite). Walk around a room and step up to objects to see
**About · Projects · Skills · Contact**. On load, a short door-opening intro plays (click or press any key to skip). A **View Portfolio** button switches to a classic web page, and there is a D-pad for phones.

## Run

```bash
npm install
npm run dev
```

Build for deployment: `npm run build` → upload the `dist/` folder (GitHub Pages, Netlify, Vercel...).

## Editing content

| What | File |
|---|---|
| Name, intro, projects, contact | `src/content.js` |
| Skills | `skill.md` |
| Object positions / trigger zones | the `OBJECTS` array in `src/scenes/RoomScene.js` |
| Colors, info panel layout | `src/style.css` |

Direct links: `/#classic` opens the classic page, `/#projects` (or `#about`, `#skills`, `#contact`) opens that section directly.

## Replacing the art with real assets (itch.io or your own)

The art is currently drawn in code in `src/art.js`. To replace it:

1. Download free assets from itch.io (search "pixel art tileset", "pixel character 16x16") and **read the license carefully**.
2. Put the files in `public/assets/`, e.g. `public/assets/bookshelf.png`.
3. Add a `preload()` to `RoomScene` and load them with the **same keys** already in use:
   ```js
   preload() {
     this.load.image('obj-skills', 'assets/bookshelf.png');
     this.load.spritesheet('player', 'assets/player.png', { frameWidth: 16, frameHeight: 16 });
   }
   ```
4. Any key loaded from a file is skipped automatically by `src/art.js`, no need to delete code. A character spritesheet has numbered frames (0, 1, 2...), so update the frame names in the animations in `RoomScene.js`.

Credit the asset authors in this README if the license requires it.
