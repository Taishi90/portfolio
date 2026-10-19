# Memories — what has been done & lessons learned

> Read this file before starting new work. When you finish something worth remembering, append an entry at the end.
> Template: `## YYYY-MM-DD — What was done` → **What**, **Decisions**, **Lessons / bugs hit**.

## Project overview (update when the structure changes)

- Portfolio as a 2D pixel art game: **Phaser 3 + Vite**, plain JavaScript (no TypeScript, no framework).
- All content and code are in **English**; replies to the user are in Vietnamese.
- Run: `npm install` → `npm run dev` (http://localhost:5173). Build: `npm run build` → `dist/`.
- Structure:
  - `src/content.js` — ALL content (about, projects, contact). Shared by the game and the classic page.
  - `skill.md` — skills. Imported with `?raw` and parsed as `## Group` / `- skill`.
  - `src/art.js` — placeholder pixel art drawn in code (player, 4 objects, room).
  - `src/scenes/RoomScene.js` — room, collisions, movement, trigger zones (the `OBJECTS` array).
  - `src/ui.js` — HTML info panel, Skip button, classic page, D-pad.
  - `src/touch.js` — D-pad button state, read by the scene every frame.
- Game is 320×240, 16px tiles, `pixelArt: true`, `Scale.FIT`. The top wall is 48px tall.

## 2026-10-19 — Built the first full version

**What**
1. Vite + Phaser 3 skeleton (its own commit).
2. Room + player + 4 objects: framed portrait = About, computer desk = Projects, bookshelf = Skills, mailbox = Contact.
3. Touch D-pad, Skip button → classic page, links `#classic` / `#about|#projects|#skills|#contact`.

**Decisions**
- Text/info is shown as **HTML over the canvas**, not drawn in Phaser → crisp text, scrollable, clickable links, proper diacritics.
- The info panel **opens automatically when entering a zone** and closes when leaving; closing it with × keeps it closed until the next visit.
- Placeholder art **drawn in code** instead of downloading itch.io assets → runs immediately, no license worries. To swap in real art: see README.
- A single content source (`content.js` + `skill.md`) for both the game and the classic page.
- Phone portrait: game on top, panel in the middle, D-pad at the bottom (panel never covers the room, you can keep walking while reading).

**Lessons / bugs hit**
- Vite reported **500 "Failed to resolve import"** while new files were being created → transient (file did not exist yet when HMR ran). Reloading fixes it.
- Phaser labels looked jagged because of `pixelArt: true` → draw text large (24px), `setScale(1/3)` and `label.texture.setFilter(LINEAR)`.
- Phaser starts its loop **right after** the `ready` event → to `game.loop.sleep()` at startup, wait one tick with `setTimeout`.
- Automated testing: synthetic `KeyboardEvent`s have no `keyCode`, so Phaser ignores them → test movement by firing `pointerdown/pointerup` on the `#dpad` buttons, or move the player with `game.scene.keys.Room.player.body.reset(x, y)` (`window.game` only exists under `npm run dev`).
- When the browser tab is hidden, `requestAnimationFrame` does not run → `game.loop.frame` stays at 0. The tab must be visible to test.
- The **phone landscape** layout is not verified yet (the emulator does not enable touch in landscape) → try it on a real device.

## 2026-10-19 — Switched everything to English

**What** — Translated all UI text, content, `skill.md`, code comments, README, CLAUDE.md and this file to English.
**Decisions** — Section titles are now About / Projects / Skills / Contact; `<html lang="en">`. Replies to the user stay in Vietnamese.

## 2026-10-19 — Rug message

**What** — "From Pixel / To Picture" fades in inside the red rug while the player stands on it (`checkRug()` in RoomScene; rug size is `RUG` in `art.js`, shared by drawing and the trigger zone).
**Decisions** — Text depth 1 so the player walks over it. The player spawns on the rug, so the message is visible right at start.
