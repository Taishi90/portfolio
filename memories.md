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
  - `src/scenes/IntroScene.js` — door-opening intro shown on every load/reload, then starts RoomScene.
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
**Decisions** — Text depth 1 so the player walks over it. The player spawns on the rug but the message stays hidden at start (`onRug = true` initially); it only appears from the second time the player steps on the rug.

## 2026-10-21 — Real projects from Google Play

**What** — Replaced the sample projects with 7 released games (Tactic Manager, Garden Guardians TD, Pop Clover, Dunk Beetle, Bomber Wasp, Winged Survivors Rush, SwatzZapz), in the order the user gave. Each is a block: icon, name (links to Google Play), short description, genre tags.
**Decisions**
- Name = Play Store title, desc = Play Store short description (`<meta name="description">`), tags = Play Store genre. Field `tech` was renamed to `tags`.
- Icons are stored locally in `public/assets/projects/<slug>.webp` (192px), referenced via `icon('<slug>')` in `content.js` — no dependency on Google links.
- To fetch a new icon: `curl -o <slug>.webp "https://play-lh.googleusercontent.com/<id>=s192-rw"` (`=s<size>` resizes, `-rw` returns WebP). The `<id>` comes from the Play page's `og:image`.
**Lessons / bugs hit**
- To scrape several Play pages at once: open one Play page in the browser, then `fetch('/store/apps/details?id=...&hl=en')` from it (same origin) and regex the `<meta>` tags. `DOMParser` is blocked there (TrustedHTML).

## 2026-10-21 — Suga Studio games (delisted)

**What** — Added I Am Hero, Overload: Online Car Shooting, Overleague after the 7 Google Play games.
- "I Am Hero" = **I Am Hero: AFK Teamfight** (iOS/iPad 1499340388, 2020, idle RPG + auto chess), NOT "I Am Hero: Superheroes Epic Battles" (Android com.HoGa.IAmHero, 2019) — corrected 2026-10-22 by the user. On the AppMagic publisher page it only shows up as an `/ipad/` link, so search the page text, not just Google Play/iPhone links.
**Decisions**
- All 3 are removed from the stores (Play returns 404), so info + icons come from AppMagic (publisher page `appmagic.rocks/publisher/suga-studio/2_1497860569`). Their title links to the Suga Studio AppMagic publisher page (`SUGA_STUDIO` in content.js, added 2026-10-22 at the user's request). A project without `link` still renders as a plain name.
- "Overload" on AppMagic has two games; the user chose **Overload: Online Car Shooting** (iOS 1064842104, 2017), NOT "Overload Arena: Metal Revenge" (2024).
- Descriptions are short one-line summaries written from the AppMagic store descriptions (no store short description exists).
**Lessons / bugs hit**
- AppMagic is an Angular SPA: read it in the browser. Icon URLs sit in `images.appmagic.rocks/?uri=<original>`; download the original URL at 192px (`=s192-rw` for Google, `/192x192bb.webp` for Apple mzstatic).

## 2026-10-21 — Bigger trigger zones

**What** — The 4 object trigger zones (`zone` in `OBJECTS`, RoomScene.js) were enlarged so walking NEAR an object opens its panel (about 20–35px around each object instead of one exact spot).
**Decisions** — Zones must not overlap each other or the rug, and the spawn point (160,150) must stay outside all of them. Added `?debug` (e.g. `http://localhost:5173/?debug`) to draw the zones (yellow) and rug (pink) for tuning.

## 2026-10-22 — Trigger zones shrunk by 50%

**What** — User found the enlarged zones too big: each zone's AREA was halved (width/height ×0.7), kept anchored on its object (≈8–18px around each object). The `?debug` zone overlay was removed at the user's request (no zone visuals at all).
**Decisions** — Current zones: about [47,48,50,25], projects [220,48,57,42], skills [16,122,42,53], contact [265,168,39,45]. History: original (too small, exact spot) → enlarged (too big) → this. Tune in small steps from here.

## 2026-10-22 — Door-opening intro

**What** — New `IntroScene` runs on every load/reload before the room (~4s): house front at night with "WELCOME" sign, name + role, player walks up, double doors swing open (leaf `scaleX` → 0.12 + darkening tint), warm light spills out, player steps in while the camera pans/zooms into the doorway, fade to warm white → `RoomScene` fades in from the same color (`DOOR_LIGHT`).
**Decisions**
- Click / tap / any key skips straight to the fade. `prefers-reduced-motion` skips the animation after 0.6s.
- Hint text and D-pad are hidden during the intro via `body.intro` (removed by `enterRoom()` in ui.js when RoomScene starts). The Skip (classic view) button stays visible.
- Door/lamp textures and `drawFacade()` live in `art.js`; walk animations moved to `createPlayerAnims()` in art.js so both scenes share them.
**Lessons / bugs hit**
- Don't tween `tint` directly (it interpolates the hex number → wrong colors). Use `tweens.addCounter` + `Phaser.Display.Color.Interpolate.ColorWithColor`.

## 2026-10-22 — I Am Hero: use the page's header icon + official text

**What** — I Am Hero: AFK Teamfight now uses the icon shown at the top of its AppMagic page (`appmagic.rocks/ipad/i-am-hero-afk-teamfight/1499340388`, a Google Play icon `cCZqs_…`) and the first two sentences of the official description verbatim.
**Lessons** — An AppMagic page can group several store apps ("5 APPS SUMMARY"); the `images.appmagic.rocks` URLs further down may belong to a different app in the group. Take the icon at the header (the image next to the `h1` title, top-left) and compare it visually with a screenshot. When the user gives a specific link, prefer the official description text over a paraphrase.
