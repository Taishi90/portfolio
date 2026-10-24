// HTML UI layered over the game: info panel, Skip button, classic page, touch D-pad
import { PROFILE, SECTIONS, STATS, esc } from './content.js';
import { DETAILS } from './projectDetails.js';
import { touch } from './touch.js';
import { isDaytime } from './view.js';

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

export const isModalOpen = () => !$('project-modal').hidden;

function openProject(id) {
  const p = PROFILE.projects.find((x) => x.id === id);
  const d = DETAILS[id];
  if (!p || !d) return;
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
    ${p.link ? `<a class="pm-store" href="${esc(p.link)}" target="_blank" rel="noopener">${storeLabel(p.link)} <span aria-hidden="true">↗</span></a>` : ''}`;
  lastFocus = document.activeElement;
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
  lastFocus?.focus?.();
}

function initProjectModal() {
  // one listener for project blocks on the portfolio page and in the game panel
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.project[data-project]');
    if (!card || e.target.closest('a')) return; // the title link still opens the store page
    openProject(card.dataset.project);
  });
  document.addEventListener('keydown', (e) => {
    const card = e.target.closest?.('.project[data-project]');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      openProject(card.dataset.project);
    }
  });
  for (const el of $('project-modal').querySelectorAll('[data-close]')) el.addEventListener('click', closeProject);
}

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function renderClassic() {
  const initials = PROFILE.name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2);
  const nav = SECTIONS.map((s) => `<a href="#${s.id}">${s.title}</a>`).join('');
  const stats = STATS.map((st) => `<li><strong>${esc(st.value)}</strong><span>${esc(st.label)}</span></li>`).join('');
  // About lives in the hero; the other sections are numbered cards below it
  const sections = SECTIONS.filter((s) => s.id !== 'about')
    .map(
      (s, i) => `<section id="${s.id}" class="block reveal">
        <h2><span class="sec-num">0${i + 1}</span>${s.title}</h2>
        ${s.html()}
      </section>`,
    )
    .join('');

  $('classic').innerHTML = `
    <nav class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="#about"><span class="brand-badge">${esc(initials)}</span>${esc(PROFILE.name)}</a>
        <div class="topbar-links">${nav}</div>
      </div>
    </nav>
    <header class="hero" id="about">
      <div class="hero-inner">
        <p class="eyebrow"><span class="dot"></span>${esc(PROFILE.role)}</p>
        <h1>${esc(PROFILE.name)}</h1>
        <div class="hero-about">${PROFILE.about.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
        <ul class="stats">${stats}</ul>
        <div class="hero-cta">
          <a class="btn btn-primary" href="#projects">View projects</a>
          <a class="btn btn-ghost btn-cv" href="${esc(PROFILE.cv)}" target="_blank" rel="noopener">Get CV <span aria-hidden="true">↗</span></a>
          <a class="btn btn-ghost" href="#contact">Get in touch</a>
        </div>
      </div>
    </header>
    <div class="blocks">${sections}</div>
    <footer class="foot">© ${new Date().getFullYear()} ${esc(PROFILE.name)} · Built with Phaser 3</footer>`;

  // sections fade up the first time they scroll into view
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    },
    { threshold: 0.12 },
  );
  for (const el of $('classic').querySelectorAll('.reveal')) io.observe(el);
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
    // replay the hero entrance animation every time the classic page is shown
    $('classic').classList.remove('enter');
    void $('classic').offsetWidth;
    $('classic').classList.add('enter');
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
