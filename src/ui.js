// HTML UI layered over the game: info panel, Skip button, classic page, touch D-pad
import { PROFILE, SECTIONS, SKILLS, STATS, esc } from './content.js';
import { DETAILS } from './projectDetails.js';
import { touch } from './touch.js';
import { isDaytime } from './view.js';
import { artImage } from './art.js';

const $ = (id) => document.getElementById(id);

export function showPanel(section) {
  $('panel-title').textContent = section.title;
  $('panel-body').innerHTML = section.html();
  $('panel').hidden = false;
  // the panel itself is the scroll box; reset it after showing it (a hidden element ignores scrollTop)
  $('panel').scrollTop = 0;
  $('hint').hidden = true;
}

// Called when the room starts: show the in-game hint and D-pad (hidden during the intro)
export function enterRoom() {
  document.body.classList.remove('intro');
}

export function hidePanel() {
  $('panel').hidden = true;
}

// ---------- project details window ----------

// Store descriptions are plain text: short lines without end punctuation (or ALL CAPS) become small headings,
// lines starting with "-" or "•" become bullet lists, everything else is a paragraph.
function formatDescription(text) {
  const lines = text.split('\n');
  let out = '';
  let list = [];
  const flush = () => {
    if (list.length) out += `<ul>${list.map((l) => `<li>${esc(l)}</li>`).join('')}</ul>`;
    list = [];
  };
  lines.forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return flush();
    const bullet = line.match(/^[-•–]\s+(.*)/);
    if (bullet) return list.push(bullet[1]);
    flush();
    const next = (lines[i + 1] || '').trim();
    const allCaps = /[A-Z]/.test(line) && line === line.toUpperCase() && line.length <= 80;
    const heading = allCaps || (line.length <= 60 && !/[.!?,;:]$/.test(line) && next !== '' && !/^[-•–]\s/.test(next));
    out += heading ? `<h4>${esc(line)}</h4>` : `<p>${esc(line)}</p>`;
  });
  flush();
  return out;
}

function storeLabel(link) {
  if (link.includes('play.google.com')) return 'Google Play';
  if (link.includes('appmagic.rocks')) return 'AppMagic';
  return 'Store page';
}

let lastFocus = null;
let currentProject = null;

const CHEVRON = (d) =>
  `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;

export const isModalOpen = () => !$('project-modal').hidden;

function openProject(id) {
  const p = PROFILE.projects.find((x) => x.id === id);
  const d = DETAILS[id];
  if (!p || !d) return;
  const wasOpen = isModalOpen();
  currentProject = id;
  const shots = d.screenshots
    .map(
      (src, i) =>
        `<a href="${esc(src)}" target="_blank" rel="noopener"><img src="${esc(src)}" alt="${esc(p.name)} screenshot ${i + 1}" loading="lazy" decoding="async" /></a>`,
    )
    .join('');
  $('pm-content').innerHTML = `
    <header class="pm-head">
      <img class="pm-icon" src="${esc(p.image)}" alt="" width="72" height="72" />
      <div>
        <h2 id="pm-title">${esc(p.name)}</h2>
        <ul class="chips">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
      </div>
    </header>
    <div class="pm-shots">${shots}</div>
    <div class="pm-desc">${formatDescription(d.description)}</div>
    <div class="pm-actions">
      ${p.link ? `<a class="pm-store" href="${esc(p.link)}" target="_blank" rel="noopener">${storeLabel(p.link)} <span aria-hidden="true">↗</span></a>` : ''}
      <span class="pm-nav">
        <button type="button" class="pm-step" data-step="-1" aria-label="Previous project">${CHEVRON('M15 18l-6-6 6-6')}</button>
        <button type="button" class="pm-step" data-step="1" aria-label="Next project">${CHEVRON('M9 18l6-6-6-6')}</button>
      </span>
    </div>`;
  // keep the element to return focus to from the first opening (not when stepping between projects)
  if (!wasOpen) lastFocus = document.activeElement;
  $('project-modal').hidden = false;
  document.documentElement.classList.add('modal-open');
  $('project-modal').querySelector('.pm-dialog').scrollTop = 0;
  $('project-modal').querySelector('.pm-shots').scrollLeft = 0;
  $('project-modal').querySelector('.pm-close').focus();
}

function closeProject() {
  if (!isModalOpen()) return;
  $('project-modal').hidden = true;
  document.documentElement.classList.remove('modal-open');
  // give focus back to the island/card that opened the popup (it may be the visible one in the other view)
  const back = lastFocus?.isConnected && lastFocus.offsetParent !== null ? lastFocus : document.querySelector(`[data-project="${currentProject}"]`);
  back?.focus?.();
}

// ←/→ buttons and arrow keys: previous / next project, wrapping around
function stepProject(dir) {
  const ids = PROFILE.projects.map((x) => x.id);
  const i = ids.indexOf(currentProject);
  openProject(ids[(i + dir + ids.length) % ids.length]);
}

function initProjectModal() {
  // one listener for project blocks on the portfolio page and in the game panel
  document.addEventListener('click', (e) => {
    const card = e.target.closest('[data-project]');
    if (!card || e.target.closest('a')) return; // the title link still opens the store page
    openProject(card.dataset.project);
  });
  document.addEventListener('keydown', (e) => {
    const card = e.target.closest?.('[data-project]');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openProject(card.dataset.project);
    }
  });
  for (const el of $('project-modal').querySelectorAll('[data-close]')) el.addEventListener('click', closeProject);
  $('project-modal').addEventListener('click', (e) => {
    const step = e.target.closest('.pm-step');
    if (step) stepProject(Number(step.dataset.step));
  });
  // inside the popup: ←/→ change project, Tab stays in the popup (focus trap)
  $('project-modal').addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      stepProject(e.key === 'ArrowLeft' ? -1 : 1);
      return;
    }
    if (e.key !== 'Tab') return;
    const focusables = [...$('project-modal').querySelectorAll('.pm-dialog a[href], .pm-dialog button')].filter((el) => el.offsetParent !== null);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Cover picture for each project: index of a landscape screenshot, or 'portrait' to set three
// portrait screenshots side by side (games that only have portrait shots)
const COVERS = { 'tactic-manager': 4, swatzzapz: 2, 'pop-clover': 'portrait', 'i-am-hero': 'portrait' };

function coverHtml(p) {
  const shots = DETAILS[p.id]?.screenshots || [];
  const c = COVERS[p.id] ?? 1;
  const portrait = c === 'portrait';
  const list = portrait ? shots.slice(0, 3) : [shots[c - 1]];
  const [w, h] = portrait ? [405, 720] : [1280, 720];
  return `<span class="shot">${list
    .map((src) => `<img src="${esc(src)}" alt="Screenshot of ${esc(p.name)}" width="${w}" height="${h}" loading="lazy" decoding="async" />`)
    .join('')}</span>`;
}

const chips = (tags) => `<ul class="chips">${tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

// Island colours cycle through the clay pastels (display only, no data needed)
const ISLAND_COLORS = ['mint', 'peach', 'sky', 'lilac', 'sand'];

// Projects as an archipelago: each game is an island (screenshot on top, wooden name sign, genre badge).
// The first project is the featured, bigger island. A list view is there for visitors in a hurry.
function projectsHtml() {
  const islands = PROFILE.projects
    .map(
      (p, i) => `<li class="isl-slot${i === 0 ? ' featured' : ''}" style="--i:${i}">
        <button type="button" class="island isl-${ISLAND_COLORS[i % ISLAND_COLORS.length]}" data-project="${esc(p.id)}" aria-label="${esc(p.name)}: open details">
          <span class="isl-body">
            <span class="isl-top">${coverHtml(p)}</span>
            <span class="isl-cliff" aria-hidden="true"></span>
          </span>
          <span class="isl-sign">
            <img src="${esc(p.image)}" alt="" width="40" height="40" loading="lazy" />
            <span class="isl-name">${esc(p.name)}</span>
          </span>
          <span class="isl-badge">${esc(p.tags[0])}</span>
        </button>
      </li>`,
    )
    .join('');
  const rows = PROFILE.projects
    .map(
      (p) => `<li>
        <button type="button" class="proj-row" data-project="${esc(p.id)}" aria-label="${esc(p.name)}: open details">
          <img src="${esc(p.image)}" alt="" width="56" height="56" loading="lazy" />
          <span class="proj-row-text">
            <span class="proj-row-name">${esc(p.name)}</span>
            <span class="proj-row-desc">${esc(p.desc)}</span>
          </span>
          <span class="proj-row-tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</span>
        </button>
      </li>`,
    )
    .join('');
  return `
    <div class="view-toggle">
      <button type="button" class="btn btn-ghost" id="view-toggle" aria-pressed="false">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
        <span>List view</span>
      </button>
    </div>
    <ul class="islands" aria-label="Projects map">${islands}</ul>
    <ul class="proj-list" aria-label="Projects list" hidden>${rows}</ul>`;
}

const VIEW_KEY = 'portfolio-projects-view';

// Map <-> list toggle (remembered in this browser) and arrow-key movement between projects
function initProjectsView() {
  const section = $('projects');
  const btn = $('view-toggle');
  const setView = (view) => {
    const list = view === 'list';
    section.querySelector('.islands').hidden = list;
    section.querySelector('.proj-list').hidden = !list;
    btn.setAttribute('aria-pressed', String(list));
    btn.querySelector('span').textContent = list ? 'Map view' : 'List view';
    btn.querySelector('svg').innerHTML = list
      ? '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14"/>'
      : '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>';
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {}
  };
  btn.addEventListener('click', () => setView(btn.getAttribute('aria-pressed') === 'true' ? 'map' : 'list'));
  let saved = 'map';
  try {
    saved = localStorage.getItem(VIEW_KEY) || 'map';
  } catch {}
  setView(saved);

  section.addEventListener('keydown', (e) => {
    const keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const current = e.target.closest('[data-project]');
    if (!current || !(e.key in keys)) return;
    const all = [...section.querySelectorAll('[data-project]')].filter((el) => el.offsetParent !== null);
    const next = all[(all.indexOf(current) + keys[e.key] + all.length) % all.length];
    e.preventDefault();
    next.focus();
  });
}

function skillsHtml() {
  return `<dl class="skill-rows">${SKILLS.map(
    (g) => `<div class="skill-row"><dt>${esc(g.title)}</dt><dd>${g.items.map(esc).join(', ')}</dd></div>`,
  ).join('')}</dl>`;
}

function contactHtml() {
  const email = PROFILE.contact.find((c) => c.href.startsWith('mailto:'));
  const others = PROFILE.contact.filter((c) => c !== email);
  return `
    ${email ? `<a class="contact-email" href="${esc(email.href)}">${esc(email.value)}</a>` : ''}
    <div class="contact-links">
      ${others.map((c) => `<a class="btn btn-ghost" href="${esc(c.href)}" target="_blank" rel="noopener">${esc(c.label)} <span aria-hidden="true">↗</span></a>`).join('')}
      <a class="btn btn-cv" href="${esc(PROFILE.cv)}" target="_blank" rel="noopener">Get CV <span aria-hidden="true">↗</span></a>
    </div>`;
}

const SECTION_HTML = { projects: projectsHtml, skills: skillsHtml, contact: contactHtml };
// the game object that holds each section in the room
const SECTION_ICON = { projects: 'obj-projects', skills: 'obj-skills', contact: 'obj-contact' };

function renderClassic() {
  const nav = SECTIONS.map((s) => `<a href="#${s.id}">${s.title}</a>`).join('');
  // the first stat (years of experience) becomes the "Lv." badge on the player card, the rest are small badges
  const [years, ...otherStats] = STATS;
  const stats = otherStats.map((st) => `<li><strong>${esc(st.value)}</strong><span>${esc(st.label)}</span></li>`).join('');
  // About lives in the hero; the other sections each have their own layout
  const sections = SECTIONS.filter((s) => s.id !== 'about')
    .map(
      (s) => `<section id="${s.id}" class="block block-${s.id}">
        <h2><img class="sec-icon" src="${artImage(SECTION_ICON[s.id])}" alt="" />${s.title}</h2>
        ${(SECTION_HTML[s.id] || s.html)()}
      </section>`,
    )
    .join('');

  $('classic').innerHTML = `
    <nav class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="#about">${esc(PROFILE.name)}</a>
        <div class="topbar-links">${nav}</div>
      </div>
    </nav>
    <header class="hero" id="about">
      <div class="hero-inner">
        <article class="player-card">
          <div class="pc-head">
            <div class="pc-avatar"><img src="${artImage('player', { scale: 6 })}" alt="${esc(PROFILE.name)}'s character from the portfolio game" width="92" height="92" /></div>
            <div>
              <span class="pc-level" title="${esc(years.label)}">Lv. ${esc(years.value)}</span>
              <h1>${esc(PROFILE.name)}</h1>
              <p class="role">${esc(PROFILE.role)}</p>
            </div>
          </div>
          <div class="hero-about">${PROFILE.about.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
          <ul class="stats">${stats}</ul>
          <div class="hero-cta">
            <a class="btn btn-primary" href="#projects">View projects</a>
            <a class="btn btn-cv" href="${esc(PROFILE.cv)}" target="_blank" rel="noopener">Get CV <span aria-hidden="true">↗</span></a>
            <a class="btn btn-ghost" href="#contact">Contact</a>
          </div>
        </article>
      </div>
    </header>
    ${sections}
    <footer class="foot">© ${new Date().getFullYear()} ${esc(PROFILE.name)}. Built with Phaser 3.</footer>`;
  initProjectsView();
}

let game;
let switching = false;

// sectionId: scroll to that section on the classic page (e.g. link .../#projects)
// Light theme by day, dark at night, for the portfolio page and the game UI (panel, hint, D-pad, switch)
function applyTheme() {
  document.documentElement.dataset.theme = isDaytime() ? 'day' : 'night';
}

function setMode(mode, sectionId) {
  const classic = mode === 'classic';
  closeProject();
  updateSwitch(mode);
  applyTheme(); // re-checked on every switch
  $('classic').hidden = !classic;
  $('game-view').hidden = classic;
  document.body.classList.toggle('classic-mode', classic);
  if (classic) {
    if (!$('classic').innerHTML) renderClassic();
    game.loop.sleep();
    if (sectionId) {
      document.getElementById(sectionId)?.scrollIntoView();
    } else {
      history.replaceState(null, '', '#classic');
      window.scrollTo(0, 0);
    }
  } else {
    game.loop.wake();
    history.replaceState(null, '', location.pathname);
    // Coming back to the game always replays the door-opening intro from the start.
    hidePanel();
    for (const dir in touch) touch[dir] = false;
    document.body.classList.add('intro');
    game.scene.stop('Room');
    game.scene.stop('Intro');
    // the house is drawn right away (under the transition tiles), its animation waits for startIntro()
    game.scene.start('Intro', { hold: true });
  }
}

function startIntro() {
  game.scene.getScene('Intro').begin();
}

// Pixel-wipe transition: tiles sweep in diagonally from the top-right (where the Skip button is),
// the view is swapped while the screen is covered, then the tiles sweep out.
const TILE = 64;
const TILE_MS = 260;
const STEP_MS = 22;

// Game | Portfolio switch: move the gold thumb and mark the active side
function updateSwitch(mode) {
  $('mode-switch').dataset.mode = mode;
  for (const btn of $('mode-switch').querySelectorAll('button')) {
    btn.setAttribute('aria-pressed', String(btn.dataset.mode === mode));
  }
}

const currentMode = () => (document.body.classList.contains('classic-mode') ? 'classic' : 'game');

async function switchMode(mode) {
  if (switching || mode === currentMode()) return;
  updateSwitch(mode); // the thumb slides right away, before the transition
  applyTheme(); // tiles use the current day/night colors
  if (reducedMotion()) {
    setMode(mode);
    if (mode === 'game') startIntro();
    return;
  }
  switching = true;

  const el = $('transition');
  const cols = Math.ceil(window.innerWidth / TILE);
  const rows = Math.ceil(window.innerHeight / TILE);
  el.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  el.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  let tiles = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) tiles += `<i style="--d:${(cols - 1 - c + r) * STEP_MS}ms"></i>`;
  }
  el.innerHTML = tiles;
  const total = (cols + rows - 2) * STEP_MS + TILE_MS;

  el.hidden = false;
  el.className = 'cover';
  await wait(total);
  setMode(mode);
  el.className = 'uncover';
  await wait(total);
  el.hidden = true;
  el.innerHTML = '';
  switching = false;
  // the intro only starts once the tiles have fully opened
  if (mode === 'game') startIntro();
}

function initDpad() {
  for (const btn of document.querySelectorAll('#dpad button')) {
    const dir = btn.dataset.dir;
    const press = (e) => {
      e.preventDefault();
      touch[dir] = true;
      btn.classList.add('active');
    };
    const release = () => {
      touch[dir] = false;
      btn.classList.remove('active');
    };
    btn.addEventListener('pointerdown', press);
    btn.addEventListener('pointerup', release);
    btn.addEventListener('pointerleave', release);
    btn.addEventListener('pointercancel', release);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  }
}

export function initUI(phaserGame) {
  game = phaserGame;
  applyTheme();
  for (const btn of $('mode-switch').querySelectorAll('button')) {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
  }
  $('panel-close').addEventListener('click', hidePanel);
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    // Esc closes the project details first, then (next press) the game info panel
    if (isModalOpen()) closeProject();
    else hidePanel();
  });
  initProjectModal();
  if (matchMedia('(pointer: coarse)').matches) {
    $('hint').textContent = 'Use the arrow buttons to walk up to the objects';
  }
  initDpad();

  // Open the classic page directly via .../#classic or a specific section such as #projects
  const hash = location.hash.slice(1);
  if (hash === 'classic' || SECTIONS.some((s) => s.id === hash)) {
    // Phaser starts its loop right AFTER the 'ready' event, so wait one tick before putting it to sleep
    game.events.once('ready', () => setTimeout(() => setMode('classic', hash === 'classic' ? null : hash)));
  }
}
