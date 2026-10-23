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
- World is 320×240, 16px tiles, `pixelArt: true`, `Scale.FIT`. The top wall is 48px tall. The canvas is `320*ZOOM × 240*ZOOM` and every scene calls `setupCamera()` (src/view.js) — all game coordinates stay in 320×240 world pixels.
  - `src/view.js` — `ZOOM`, `FONT` (Nunito), `setupCamera()`, `crispText()` for ALL in-game text.

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
- Phaser labels looked jagged because of `pixelArt: true` → (superseded 2026-10-22, see "Readable game text").
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
- Descriptions are the first two sentences of each official store description, VERBATIM (user asked on 2026-10-22), except Overleague's original typo "is a one of" fixed to "is one of" at the user's request.
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

## 2026-10-22 — Readable game text (no more pixelated labels)

**What** — Object labels, rug text and intro texts were blurry/pixelated because the canvas itself was only 320×240 and got upscaled. Now the canvas is drawn at `ZOOM` (2–6, ≈ screen size × devicePixelRatio, computed once at load) and each camera zooms by `ZOOM`; text uses the **Nunito** 800 font (Google Fonts in index.html, `document.fonts.load` before the game starts, 1.5s timeout).
**Decisions** — Use `crispText(scene, x, y, text, sizeInWorldPx, {color, stroke, strokeColor, lineSpacing})` for any game text; never `scene.add.text` directly. Removed `canvas { image-rendering: pixelated }` (canvas is ~screen resolution now). Physics world bounds must be set to 320×240 explicitly (`physics.world.setBounds`), otherwise they follow the big canvas. Camera tweens that zoom must multiply by `ZOOM` (intro: `zoomTo(5 * ZOOM)`).
**Lessons / bugs hit** — Intro stars were never visible: `drawFacade()` paints the sky over them → stars must be added after the facade.

## 2026-10-22 — Classic view redesign + pixel-wipe transition

**What** — Classic page is now a modern "gaming" dark theme: sticky top bar (initials badge, section links, gold "Play the game" button), hero (role chip, big name, about text, stats from `STATS` in content.js, CTA buttons, faint grid + gold/teal glows), numbered sections (01 Projects, 02 Skills, 03 Contact) as hover-lift cards, footer. Sections fade up when scrolled into view (IntersectionObserver), hero animates in each time the page is shown.
**Transition** — `switchMode(mode)` in ui.js: a grid of 64px tiles (`#transition`) sweeps in diagonally from the top-right (Skip button corner) with a gold leading edge, the view swaps while covered, tiles sweep out. Used by Skip and "Play the game" both ways. Direct links (#classic, #projects…) and `prefers-reduced-motion` skip it.
**Decisions**
- Palette (CSS vars on `#classic`): bg #0e0c18, surfaces #17142a/#1f1b38, text #ece8f7, muted #a49dc4, **gold #ffcc4d = main accent** (from the game), **teal #5fe3d0 = secondary** (links, chips). Red only stays in the game panel. Font: Nunito 400–800.
- All classic styles are scoped under `#classic`, so the in-game info panel keeps its own look. Skills html now wraps each group in `.skill-group` (inside `.skill-groups`) for card layout.
- About is shown in the hero (`id="about"`), not as a separate card section.

## 2026-10-22 — "View Portfolio" button + intro replays on return

**What** — The in-game "Skip ⏭ Classic view" button is now **"View Portfolio →"**, styled like the classic page (gold outline pill on dark glass, Nunito, fills gold on hover). Coming back from the classic page always restarts `IntroScene` from the beginning (Room and Intro are stopped, Intro started; panel closed, D-pad state reset, `body.intro` re-added) — the game no longer resumes where it was paused.
**Note** — README/older entries may still say "Skip button": it is the same `#skip-btn`, only the label changed.

## 2026-10-22 — Game UI matches the portfolio theme; intro waits for the transition; Tools skills

**What**
- Returning to the game: Room/Intro are stopped while the tiles cover/uncover; `startIntro()` runs only after the tiles have fully opened (reduced-motion: right away).
- Game HTML UI restyled to the portfolio theme: info panel = dark glass card with gold edge + gold title bar, round close button; hint = glass pill; D-pad = glass keys with gold outline (gold when pressed). Phaser `backgroundColor` = `#0e0c18`. The pixel-art room itself is unchanged.
- skill.md: new **Tools** group (Git, Jira, Google Workspace) after Database Management.
**Decisions**
- Theme vars (`--c-*`, `--font` = Nunito) live on `:root` now. Card styles for projects / skill groups / contact / chips are shared via `:is(#classic, #panel)` so the panel and the portfolio page always look the same. Panel-only tweaks use the `#game-view #panel …` prefix (higher specificity than the shared rules).
- The old pixel-style global `button` look (thick border + drop shadow) is gone.

## 2026-10-22 — Game | Portfolio switch replaces the two buttons

**What** — `#skip-btn` ("View Portfolio") and `#play-btn` ("Play the game") were removed. One `#mode-switch` (🎮 Game | 📄 Portfolio segmented control, gold sliding thumb) sits outside both views, `position: fixed`, so it is in exactly the same spot on both screens: `right: max(16px, (100vw - --c-max)/2 + 20px)`, top 10px (aligned with the portfolio top bar's content edge).
**Decisions** — The thumb moves immediately on click (`updateSwitch`), then the pixel-wipe transition runs; clicking the active side does nothing. `setMode()` keeps the switch in sync (also for direct #classic links). The portfolio top bar reserves `padding-right: 260px` (mobile: the brand row has `padding-right: 206px`) so links never go under the switch. z-index: switch 20 > top bar 10, < transition tiles 100.

## 2026-10-22 — Casual mobile-game art style (replaces pixel art)

**What** — Player, room, 4 objects, plant, "!" badge and the intro house/door were redrawn in the style of the user's reference (Layerlab "GUI Pro – Casual Game" on the Unity Asset Store — used only as visual inspiration, nothing downloaded): chunky rounded shapes, thick navy outline `#1c2541`, vertical gradients, glossy top highlight + darker bottom band, soft drop shadows, saturated colors (blue walls, warm wood floor, red/yellow/green accents). Player = chibi (big head, big eyes, blush). Intro = night sky with moon, blue house, red roof, lit windows, bushes, yellow WELCOME plaque.
**How** — `src/art.js` draws everything with Canvas 2D (`canvasTexture`, helpers `blob/box/ball/shadow`) at `R = ZOOM` texture px per world px; scenes show them with `setScale(1 / R)`. Room and facade are single big canvas textures (`room-bg`, `facade`). `pixelArt` is off (`antialias: true`).
**Lessons / gotchas**
- Arcade body `setSize`/`setOffset` on a scaled sprite are in TEXTURE pixels. The player is shown `PLAYER_SCALE` (1.25, user request 2026-10-22) bigger: scale `PLAYER_SCALE / R`, body `10R/PLAYER_SCALE × 6R/PLAYER_SCALE` at the bottom of the 16R frame → still a 10×6 world-px feet hitbox; depth = `y + 8 * PLAYER_SCALE`.
- Use `img.displayHeight` (not `img.height`) for world positions of scaled images. Door swing tween: `scaleX: 0.12 / R`.
- World layout, collisions, trigger zones and RUG/DOORWAY rects did not change.
- The old pixel-art module is in git history (commit before this one) if ever needed.

## 2026-10-22 — No black gap when returning to the game

**What** — Coming back from the portfolio, `IntroScene` is started with `{ hold: true }` while the tiles are still covering: the house is drawn under the tiles (no fade from black), and `startIntro()` → `IntroScene.begin()` starts the walk/door animation only once the tiles are fully gone. First page load still fades in from black and calls `begin()` right away.
**Lesson** — "Intro only after the tiles open" means the ANIMATION waits, not the scene: stopping all scenes left a dark canvas that the user saw as a black loading gap.

## 2026-10-22 — Intro day / night by real local time

**What** — The intro picks its sky from the viewer's local clock (`isDaytime()` in IntroScene.js): **day 6:00–17:59** = bright blue sky, rotating sun (`'sun'` texture, 24s per turn), 3 clouds drifting right and wrapping (`'cloud'`), clear blue windows, lamps steady; **night 18:00–5:59** = old look (moon, twinkling stars, warm lit windows, pulsing lamps). Facade textures are `'facade-day'` / `'facade-night'` (`drawFacade(scene, W, H, day)`).
**Testing** — add `?sky=day` or `?sky=night` to the URL to force one.
**Room window** — also follows `isDaytime()` (added same day at the user's request): `drawRoom(..., day)` → `'room-bg-day'` (blue sky + cloud) / `'room-bg-night'` (night sky, moon, stars). The portfolio page follows it too (see next entry).

## 2026-10-22 — Portfolio page day / night theme

**What** — `isDaytime()` moved to `src/view.js` (shared by IntroScene, RoomScene, ui.js). Each time the portfolio page is shown, `setMode('classic')` sets `<html data-theme="day|night">`. Day = light theme: bg #f4f7ff, white cards with soft navy shadows, text navy #1c2541 (= game outline), muted #56608a, accents deepened for contrast (gold #e8930c, teal #0d9488; primary button stays #ffcc4d), light Game | Portfolio switch. Night = the dark theme as before.
**Decisions** — Day overrides live in one CSS block `html[data-theme='day'] #classic …` (it redefines the `--c-*` vars on `#classic` + the few hardcoded rgba colors). The transition tiles stay dark in both themes.
**Update (same day)** — the game UI follows the theme too: `applyTheme()` in ui.js runs at load and on every mode switch; the day CSS block scopes the vars to `:is(#classic, #game-view, #mode-switch)` and adds light styles for `#panel`, `#hint`, `#dpad button` (+ `.active`) and the switch. The page background around the canvas stays dark.

## 2026-10-22 — Transitions follow day / night

**What** — All scene transitions use the theme:
- Game ↔ Portfolio pixel tiles: CSS vars `--tile` / `--tile-edge` on `#transition` (night `#0e0c18`, day `#f4f7ff`, gold edge in both). `switchMode()` calls `applyTheme()` before covering so the tiles get the current colors.
- Intro first appearance: fades in from `fadeColors(day).start` (day = light #f4f7ff, night = black).
- Intro → room: fade through `fadeColors(day).door` (day = pale warm `255,246,216`, night = deeper amber `255,205,120`); RoomScene fades in from the same color. `DOOR_LIGHT` constant was replaced by `fadeColors()` in IntroScene.js.

## 2026-10-22 — GitHub Pages setup (not pushed yet)

**What** — `vite.config.js` (`base: './'` = relative asset paths, `chunkSizeWarningLimit: 1600` because Phaser is ~1.2 MB) and `.github/workflows/deploy.yml` (on push to `main`: npm ci → build → upload `dist` → deploy-pages). Tested by serving `dist` under `/portfolio/`: game, fonts and all 10 icons load.
**State** — Remote is `https://github.com/Taishi90/portfolio.git`; GitHub only has the initial commit. `git fetch` failed with "Invalid username or token" → the user must fix GitHub login on this Mac before pushing (e.g. GitHub CLI `gh auth login`, or GitHub Desktop). After the first push: Settings → Pages → Source: GitHub Actions. Expected URL: https://taishi90.github.io/portfolio/
**Rule** — never push without the user's explicit OK.

## 2026-10-22 — Panel scroll reset (mobile bug)

**Bug** — Scrolling an info panel, closing it, then opening another object's panel kept the old scroll position (noticed on mobile, where the panel is short and scrolls a lot).
**Fix** — `showPanel()` resets `#panel.scrollTop` (the panel itself is the scroll box, not `#panel-body`) AFTER `hidden = false` (scrollTop on a `display:none` element is ignored).
**Deploy** — the site is live at https://www.linhnguyen.cloud/ (custom domain, set up 2026-10-22; https://taishi90.github.io/portfolio/ redirects there) via GitHub Pages + Actions. A push to `main` redeploys; the user pushes with GitHub Desktop — never push without asking.

## 2026-10-23 — Project details window (click a project block)

**What** — Clicking (or Enter/Space on) any project block, on the portfolio page or in the game panel, opens `#project-modal`: icon, name, tags, 4 swipeable screenshots, full description, store button ("Google Play ↗" / "AppMagic ↗"). Closes with ×, Esc (Esc closes the modal before the game panel), or clicking the backdrop. Phone: bottom sheet. Follows the day/night theme. The player can't move while it is open (`isModalOpen()` checked in RoomScene.update). Switching Game ↔ Portfolio closes it.
**Data (stored locally, user's choice)** — `src/projectDetails.js` (`DETAILS[id] = { screenshots, description }`, generated once by a scratch script) + screenshots in `public/assets/projects/<id>/1.webp…4.webp` (720px tall, ~3.8 MB total, loaded only when a details window opens). Each project in content.js now has an `id` (= icon slug).
- Sources: 7 games = live Google Play pages (first 4 store screenshots). I Am Hero = AppMagic description + iPad screenshots from its "App Page History" tab. Overload = AppMagic description + 4 iPhone screenshots from the Wayback Machine copy of its App Store page (2019). Overleague = description + screenshots from the Wayback Machine copy of its Google Play page (Dec 2022).
- Removed from descriptions (user request): social links, Discord, support emails/pages, terms/privacy, hashtags, review-request/footer lines. Overleague "is a one of" → "is one of"; Overload "carís/thatís" encoding glitches fixed.
**Lessons**
- Google image CDN: `=h720-rw` can return LOSSLESS WebP (~1 MB); add `-v1` (`=h720-rw-v1`) for lossy (~130 KB).
- Apple mzstatic: replace the size suffix with `/0x720h.webp`.
- AppMagic "App Page History" and some data need login — never log in; Wayback CDX API (`web.archive.org/cdx/search/cdx?url=…&output=json`) finds old store pages; fetch with `id_` in the URL and `curl --compressed`.
- This Mac's Python has no SSL certs → download with `curl`, parse local files with `python3 -I`.
- Description formatter (ui.js `formatDescription`): ALL-CAPS lines or short lines without end punctuation followed by text → `<h4>`; lines starting with "-", "•" → bullet list; else `<p>`.
