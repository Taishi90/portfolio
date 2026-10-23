# Pixel Portfolio

A portfolio as a 2D pixel art game (Phaser 3 + Vite). Walk around a room and step up to objects to see
**About · Projects · Skills · Contact**. On load, a short door-opening intro plays (click or press any key to skip). A **🎮 Game | 📄 Portfolio** switch (top-right, same place on both screens) toggles between the game and a classic web page, and there is a D-pad for phones.

## Run

```bash
npm install
npm run dev
```

Build for deployment: `npm run build` → the site is in `dist/` (relative paths, works at any address).

## Publish on GitHub Pages

`.github/workflows/deploy.yml` builds and publishes the site on every push to `main`.

1. Push the repo to GitHub (`git push`).
2. One time only: on GitHub open **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Wait for the "Deploy to GitHub Pages" run in the **Actions** tab to finish (1–2 minutes).
4. The site is live at **https://taishi90.github.io/portfolio/**. Every later push to `main` updates it automatically.

GitHub Pages is free for public repositories (a private repo needs a paid plan).

## Editing content

| What | File |
|---|---|
| Name, intro, projects, contact | `src/content.js` |
| Project details (full description, screenshots) | `src/projectDetails.js` + `public/assets/projects/<id>/1-4.webp` |
| Skills | `skill.md` |
| Object positions / trigger zones | the `OBJECTS` array in `src/scenes/RoomScene.js` |
| Colors, info panel layout | `src/style.css` |

Direct links: `/#classic` opens the classic page, `/#projects` (or `#about`, `#skills`, `#contact`) opens that section directly.

## Replacing the art with real assets

The art is drawn in code in `src/art.js` (bright "casual mobile game" style: chunky shapes, navy outlines, glossy highlights). Every texture is drawn `R` times bigger than its size in the 320×240 world (`R` = render zoom, 2–6) and shown with `setScale(1 / R)`. To replace a piece with an image:

1. Put the file in `public/assets/`, e.g. `public/assets/bookshelf.png`. If it comes from an asset store or itch.io, **check the license** and credit the author here if required.
2. Load it in the scene's `preload()` with the **same key** already in use (`'player'`, `'obj-about'`, `'obj-projects'`, `'obj-skills'`, `'obj-contact'`, `'deco-plant'`, `'bang'`, `'door-leaf'`, `'lamp'`, `'room-bg'`, `'facade'`). Keys that already exist are skipped by `src/art.js`.
3. Make the image `R×` its world size (e.g. a 24×40 bookshelf → 96×160 px at R = 4), or change its `setScale` in the scene.
4. A character spritesheet has numbered frames (0, 1, 2…), so update the frame names in the walk animations in `src/art.js`.
